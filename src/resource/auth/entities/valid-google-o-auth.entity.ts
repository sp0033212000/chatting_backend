import { ApiProperty } from '@nestjs/swagger';

export class ValidGoogleOAuthEntity {
  @ApiProperty({ type: String })
  accessToken: string;
}
