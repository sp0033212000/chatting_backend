import { OmitType } from '@nestjs/swagger';
import { UserEntity } from '../../../service/user/entities/user.entity';

export class UserProfileEntity extends OmitType(UserEntity, [
  'accessToken',
  'issuerToken',
] as const) {}
