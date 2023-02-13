import type { ParticipateConversation } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ParticipateConversationEntity implements ParticipateConversation {
  @ApiProperty({
    type: String,
  })
  id: string;
  @ApiProperty({
    type: String,
  })
  userId: string;
  @ApiProperty({
    type: String,
  })
  conversationId: string;
  @ApiProperty({
    type: String,
  })
  token: string;
  @ApiProperty({
    type: Boolean,
  })
  active: boolean;
}
