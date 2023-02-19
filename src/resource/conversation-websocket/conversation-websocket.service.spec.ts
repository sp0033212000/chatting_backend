import { Test, TestingModule } from '@nestjs/testing';
import { ConversationWebsocketService } from './conversation-websocket.service';

describe('ConversationWebsocketService', () => {
  let service: ConversationWebsocketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConversationWebsocketService],
    }).compile();

    service = module.get<ConversationWebsocketService>(
      ConversationWebsocketService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
