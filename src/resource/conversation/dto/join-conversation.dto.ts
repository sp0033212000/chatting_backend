import { ApiProperty } from '@nestjs/swagger';

export class JoinConversationDto {
  @ApiProperty({
    type: String,
  })
  conversationId: string;
}
