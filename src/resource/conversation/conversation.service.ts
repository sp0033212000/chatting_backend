import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../service/prisma/prisma.service';
import { TwilioService } from '../../service/twilio/twilio.service';
import { UserService } from '../../service/user/user.service';
import { ConversationEntity } from './entities/conversation.entity';
import { JoinConversationDto } from './dto/join-conversation.dto';
import { JoinConversationEntity } from './entities/join-conversation.entity';
import {
  ConversationParticipant,
  FindConversationEntity,
} from './entities/find-conversation.entity';

@Injectable()
export class ConversationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly twilio: TwilioService,
    private readonly userService: UserService,
  ) {}

  async create(): Promise<ConversationEntity> {
    const user = await this.userService.getUser();

    const roomName = `${user.name}'s Room`;

    // const room = await this.twilio.video.rooms.create({
    //   uniqueName: roomName,
    //   type: 'group-small',
    // });

    const { chatServiceSid, messagingServiceSid, friendlyName, sid } =
      await this.twilio.conversations.v1.conversations.create({
        friendlyName: roomName,
        timers: { closed: 'P1D' },
        uniqueName: user.id,
      });

    return await this.prisma.conversation.create({
      data: {
        creator: {
          connect: {
            id: user.id,
          },
        },
        chatServiceSid,
        messagingServiceSid,
        roomName: friendlyName,
        conversationSid: sid,
        uniqueName: user.id,
      },
    });
  }

  async findAll(): Promise<Array<FindConversationEntity>> {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        active: true,
      },
    });

    return await Promise.all(
      conversations.map(
        async ({
          participantIds,
          ...conversation
        }): Promise<FindConversationEntity> => {
          const participants = await this.prisma.user.findMany({
            where: {
              OR: participantIds.map((id) => ({ id })),
            },
          });

          return {
            ...conversation,
            participants: participants.map(({ id, name, pictureUrl }) => ({
              id,
              name,
              pictureUrl,
            })),
          };
        },
      ),
    );
  }

  async reJoin(): Promise<JoinConversationEntity | null> {
    const user = await this.userService.getUser();
    return await this.prisma.participateConversation.findFirst({
      where: {
        userId: user.id,
        active: true,
      },
    });
  }

  async findOne(conversationId: string): Promise<FindConversationEntity> {
    const { participantIds, ...conversation } =
      await this.prisma.conversation.findUnique({
        where: { id: conversationId },
      });

    if (!conversation.active)
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);

    const participants = await this.userService
      .findMany({
        where: {
          OR: participantIds.map((id) => ({ id })),
        },
      })
      .then((data) =>
        data.map<ConversationParticipant>(({ id, name, pictureUrl }) => ({
          id,
          name,
          pictureUrl,
        })),
      );

    return {
      ...conversation,
      participants,
    };
  }

  async joinConversation({
    conversationId,
  }: JoinConversationDto): Promise<JoinConversationEntity> {
    const user = await this.userService.getUser();
    const { id, chatServiceSid, participants, roomName, conversationSid } =
      await this.findOne(conversationId);

    let participate = await this.prisma.participateConversation.findFirst({
      where: {
        userId: user.id,
        conversationId: id,
      },
    });

    if (participate) {
      if (!participate.active) {
        throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
      } else {
        return participate;
      }
    } else {
      if (!user.twilioSid) {
        const twilioUser = await this.twilio.createUser(user.id, user.name);

        await this.userService.updateUser({
          where: {
            id: user.id,
          },
          data: {
            twilioSid: twilioUser.sid,
          },
        });
      }

      if (!user.participantSid) {
        const participant = await this.twilio.conversations.v1
          .conversations(conversationSid)
          .participants.create({ identity: user.id });

        await this.userService.updateUser({
          where: {
            id: user.id,
          },
          data: {
            participantSid: participant.sid,
          },
        });
      }

      const token = await this.twilio.getConversationToken({
        serviceSid: chatServiceSid,
        identity: user.id,
        room: roomName,
      });

      await this.prisma.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          participantIds: participants.map(({ id }) => id).concat(user.id),
          updatedAt: new Date(),
        },
      });

      participate = await this.prisma.participateConversation.create({
        data: {
          userId: user.id,
          conversationId: id,
          token,
        },
      });

      return participate;
    }
  }

  async closeConversation(conversationId: string) {
    const user = await this.userService.getUser();
    const conversation = await this.findOne(conversationId);
    await this.twilio.conversations.v1
      .conversations(conversation.conversationSid)
      .participants(user.participantSid)
      .remove();

    await this.twilio.removeUser(user.twilioSid);
    await this.userService.updateUser({
      where: {
        id: user.id,
      },
      data: {
        participantSid: null,
        twilioSid: null,
        participateConversation: {
          updateMany: {
            where: {
              userId: user.id,
              conversationId,
            },
            data: {
              active: false,
            },
          },
        },
      },
    });

    if (conversation.creatorId === user.id) {
      await this.twilio.conversations.v1
        .conversations(conversation.conversationSid)
        .remove();
      await this.prisma.participateConversation.updateMany({
        where: {
          conversationId,
        },
        data: {
          active: false,
        },
      });
      await this.prisma.conversation.update({
        where: {
          id: conversation.id,
        },
        data: {
          active: false,
          participantIds: [],
        },
      });
    } else {
      await this.prisma.conversation.update({
        where: {
          id: conversation.id,
        },
        data: {
          participantIds: conversation.participants
            .filter(({ id }) => id !== user.id)
            .map(({ id }) => id),
        },
      });
    }

    return { message: 'succeed' };
  }
}
