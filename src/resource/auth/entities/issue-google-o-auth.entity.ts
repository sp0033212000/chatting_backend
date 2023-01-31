import { ApiProperty } from '@nestjs/swagger';

export class IssueGoogleOAuthEntity {
  @ApiProperty({ type: String })
  authURL: string;
}
