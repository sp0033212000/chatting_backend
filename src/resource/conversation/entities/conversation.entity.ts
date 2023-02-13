import type { Conversation as IConversation } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ConversationEntity implements IConversation {
  @ApiProperty({
    type: String,
  })
  id: string;
  @ApiProperty({
    type: Boolean,
  })
  active: boolean;
  @ApiProperty({
    type: String,
    isArray: true,
  })
  participantIds: Array<string>;
  @ApiProperty({
    type: String,
  })
  creatorId: string;
  @ApiProperty({
    type: String,
  })
  conversationSid: string;
  @ApiProperty({
    type: String,
  })
  chatServiceSid: string;
  @ApiProperty({
    type: String,
  })
  messagingServiceSid: string;
  @ApiProperty({
    type: String,
  })
  roomSid: string;
  @ApiProperty({
    type: String,
  })
  roomName: string;
  @ApiProperty({
    type: Date,
  })
  createdAt: Date;
  @ApiProperty({
    type: Date,
  })
  updatedAt: Date;
}
