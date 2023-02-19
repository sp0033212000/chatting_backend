import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';

import { AppService } from './app.service';
import { PrismaService } from './service/prisma/prisma.service';
import { UserService } from './service/user/user.service';
import { AuthModule } from './resource/auth/auth.module';
import { GoogleService } from './service/google/google.service';
import { TwilioService } from './service/twilio/twilio.service';
import { ConversationModule } from './resource/conversation/conversation.module';
import { ConversationWebsocketModule } from './resource/conversation-websocket/conversation-websocket.module';
import { ConversationWebsocketGateway } from './resource/conversation-websocket/conversation-websocket.gateway';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ConversationModule,
    ConversationWebsocketModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    UserService,
    GoogleService,
    JwtService,
    TwilioService,
    ConversationWebsocketGateway,
  ],
  exports: [
    PrismaService,
    JwtService,
    UserService,
    GoogleService,
    TwilioService,
    ConversationWebsocketGateway,
  ],
})
export class AppModule {}
