import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../service/prisma/prisma.service';
import { TwilioService } from '../../service/twilio/twilio.service';
import { UserService } from '../../service/user/user.service';
import { ConversationEntity } from './entities/conversation.entity';
import { JoinConversationDto } from './dto/join-conversation.dto';
import { JoinConversationEntity } from './entities/join-conversation.entity';
import { FindConversationEntity } from './entities/find-conversation.entity';
import { ConversationWebsocketGateway } from '../conversation-websocket/conversation-websocket.gateway';

@Injectable()
export class ConversationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly twilio: TwilioService,
    private readonly userService: UserService,
    private readonly ConversationWebsocketGateway: ConversationWebsocketGateway,
  ) {}

  async create(): Promise<ConversationEntity> {
    const user = await this.userService.getUser();

    const roomName = `${user.name}'s Room`;

    const { chatServiceSid, messagingServiceSid, friendlyName, sid } =
      await this.twilio.conversations.v1.conversations.create({
        friendlyName: roomName,
        timers: { closed: 'P1D' },
        uniqueName: user.id,
      });

    const conversation = await this.prisma.conversation.create({
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
    this.ConversationWebsocketGateway.emitConversationCreated(
      await this.convertConversationToFindConversation(conversation),
    );

    return conversation;
  }

  async findAll(): Promise<Array<FindConversationEntity>> {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        active: true,
      },
    });

    return await Promise.all(
      conversations.map(
        async (conversation) =>
          await this.convertConversationToFindConversation(conversation),
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
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation.active)
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);

    return await this.convertConversationToFindConversation(conversation);
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
        active: true,
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

      const conversation = await this.prisma.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          participantIds: participants.map(({ id }) => id).concat(user.id),
          updatedAt: new Date(),
        },
      });

      this.ConversationWebsocketGateway.emitConversationUpdated(
        await this.convertConversationToFindConversation(conversation),
      );

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

    await this.userService.updateUser({
      where: {
        id: user.id,
      },
      data: {
        participantSid: null,
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
      this.ConversationWebsocketGateway.emitConversationClosed(conversation.id);
    } else {
      const newConversation = await this.prisma.conversation.update({
        where: {
          id: conversation.id,
        },
        data: {
          participantIds: conversation.participants
            .filter(({ id }) => id !== user.id)
            .map(({ id }) => id),
        },
      });
      this.ConversationWebsocketGateway.emitConversationUpdated(
        await this.convertConversationToFindConversation(newConversation),
      );
    }

    return { message: 'succeed' };
  }

  private async convertConversationToFindConversation({
    participantIds,
    ...conversation
  }: ConversationEntity): Promise<FindConversationEntity> {
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
  }
}
