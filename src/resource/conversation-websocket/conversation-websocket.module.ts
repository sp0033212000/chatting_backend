import { Module } from '@nestjs/common';
import { ConversationWebsocketService } from './conversation-websocket.service';
import { ConversationWebsocketGateway } from './conversation-websocket.gateway';

@Module({
  providers: [ConversationWebsocketGateway, ConversationWebsocketService],
})
export class ConversationWebsocketModule {}
