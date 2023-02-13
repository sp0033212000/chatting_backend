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

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ConversationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    UserService,
    GoogleService,
    JwtService,
    TwilioService,
  ],
  exports: [
    PrismaService,
    JwtService,
    UserService,
    GoogleService,
    TwilioService,
  ],
})
export class AppModule {}
