import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../../auth.guard';
import { JoinConversationDto } from './dto/join-conversation.dto';
import { ConversationEntity } from './entities/conversation.entity';
import { JoinConversationEntity } from './entities/join-conversation.entity';
import { FindConversationEntity } from './entities/find-conversation.entity';
import { GetConversationSocketUrlEntity } from './entities/get-conversation-socket-url.entity';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('ConversationApi')
@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @ApiResponse({
    type: ConversationEntity,
  })
  @Post()
  @ApiOperation({ summary: 'create 建立conversation' })
  create(): Promise<ConversationEntity> {
    return this.conversationService.create();
  }

  @ApiResponse({
    type: FindConversationEntity,
    isArray: true,
  })
  @Get()
  @ApiOperation({ summary: 'findAll 取得所有conversation' })
  findAll(): Promise<Array<FindConversationEntity>> {
    return this.conversationService.findAll();
  }

  @ApiResponse({
    type: JoinConversationEntity,
    isArray: true,
  })
  @Get('reJoin')
  @ApiOperation({ summary: 'reJoin 返回已加入conversation' })
  reJoin(): Promise<JoinConversationEntity> {
    return this.conversationService.reJoin();
  }

  @ApiResponse({
    type: GetConversationSocketUrlEntity,
  })
  @Get('getSocketUrl')
  @ApiOperation({ summary: 'getSocketUrl 取得socket Url' })
  getSocketUrl(@Req() req: Request): GetConversationSocketUrlEntity {
    return {
      url: `${req.protocol}://${req.get('Host')}/ws-conversation`,
    };
  }

  @ApiResponse({
    type: FindConversationEntity,
    isArray: true,
  })
  @Get(':conversationId')
  @ApiOperation({ summary: 'findOne 取得特定conversation' })
  findOne(
    @Param('conversationId') conversationId: string,
  ): Promise<FindConversationEntity> {
    return this.conversationService.findOne(conversationId);
  }

  @ApiResponse({
    type: JoinConversationEntity,
  })
  @Post('/join')
  @ApiOperation({ summary: 'joinConversation 加入conversation' })
  joinConversation(
    @Body() body: JoinConversationDto,
  ): Promise<JoinConversationEntity> {
    return this.conversationService.joinConversation(body);
  }

  @Delete('close')
  @ApiOperation({ summary: 'closeConversation 離開 conversation' })
  async closeConversation(@Query('conversationId') conversationId: string) {
    return await this.conversationService.closeConversation(conversationId);
  }
}
