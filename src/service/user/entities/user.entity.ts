import type { User, UserAuthIssuer as TUserAuthIssuer } from '@prisma/client';
import { UserAuthIssuer } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserEntity implements User {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  name: string;
  @ApiProperty({ type: String })
  email: string;
  @ApiPropertyOptional({ type: String })
  pictureUrl: string | null;
  @ApiPropertyOptional({
    enumName: 'UserAuthIssuer',
    enum: Object.keys(UserAuthIssuer),
  })
  issuer: TUserAuthIssuer | null;
  @ApiPropertyOptional({ type: String })
  accessToken: string | null;
  @ApiPropertyOptional({ type: String })
  issuerToken: string | null;
}
