import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { ConversationEntity } from './conversation.entity';
import { UserEntity } from '../../../service/user/entities/user.entity';

export class ConversationParticipant extends PickType(UserEntity, [
  'id',
  'name',
  'pictureUrl',
]) {}

export class FindConversationEntity extends OmitType(ConversationEntity, [
  'participantIds',
]) {
  @ApiProperty({
    type: ConversationParticipant,
    isArray: true,
  })
  participants: Array<ConversationParticipant>;
}
