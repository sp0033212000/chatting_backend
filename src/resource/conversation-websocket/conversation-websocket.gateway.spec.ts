import { Test, TestingModule } from '@nestjs/testing';
import { ConversationWebsocketGateway } from './conversation-websocket.gateway';
import { ConversationWebsocketService } from './conversation-websocket.service';

describe('ConversationWebsocketGateway', () => {
  let gateway: ConversationWebsocketGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConversationWebsocketGateway, ConversationWebsocketService],
    }).compile();

    gateway = module.get<ConversationWebsocketGateway>(
      ConversationWebsocketGateway,
    );
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
