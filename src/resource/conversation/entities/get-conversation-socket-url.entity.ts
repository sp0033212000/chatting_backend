import { ApiProperty } from '@nestjs/swagger';

export class GetConversationSocketUrlEntity {
  @ApiProperty({ type: String })
  url: string;
}
