import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { FindConversationEntity } from '../conversation/entities/find-conversation.entity';

export enum ConversationWSEventEnum {
  CREATED = 'created',
  UPDATED = 'updated',
  CLOSED = 'closed',
  JOIN = 'join',
  LEAVE = 'leave',
}

@WebSocketGateway({
  namespace: '/ws-conversation',
})
export class ConversationWebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  public wss: Server;
  public EventEnum = ConversationWSEventEnum;
  private logger: Logger = new Logger('ConversationGateway');

  public emitConversationCreated(conversation: FindConversationEntity) {
    this.wss.emit(this.EventEnum.CREATED, conversation);
  }

  public emitConversationUpdated(conversation: FindConversationEntity) {
    this.wss.emit(this.EventEnum.UPDATED, conversation);
  }

  public emitConversationClosed(conversationId: string) {
    this.wss.emit(this.EventEnum.CLOSED, { conversationId });
  }

  afterInit(_server: any): any {
    this.logger.log('Initialized');
  }

  handleConnection(client: Socket, ..._args): any {
    this.logger.log(`Client:${client.id} connected`);
  }

  handleDisconnect(client: any): any {
    this.logger.log(`Client:${client.id} disconnected`);
  }

  @SubscribeMessage(ConversationWSEventEnum.JOIN)
  handleJoinConversation(
    @MessageBody('conversationId') conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.warn(
      `Client:${client.id} joining conversation: ${conversationId}`,
    );
    client.join(conversationId);
    client.emit('joinedConversation', conversationId);
  }

  @SubscribeMessage(ConversationWSEventEnum.LEAVE)
  handleLeaveConversation(
    @MessageBody('conversationId') conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.warn(
      `Client:${client.id} leaving conversation: ${conversationId}`,
    );
    client.leave(conversationId);
    client.emit('leavedConversation', conversationId);
  }
}
