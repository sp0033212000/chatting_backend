import { ApiProperty } from '@nestjs/swagger';

export class ValidGoogleOAuthDto {
  @ApiProperty({ type: String })
  code: string;
  @ApiProperty({ type: String })
  scope: string;
  @ApiProperty({ type: String })
  authuser: string;
  @ApiProperty({ type: String })
  hd: string;
  @ApiProperty({ type: String })
  prompt: string;
  @ApiProperty({ type: String })
  redirect_url: string;
}
