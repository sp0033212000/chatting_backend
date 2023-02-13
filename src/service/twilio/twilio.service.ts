import { Injectable } from '@nestjs/common';
import * as twilio from 'twilio';

@Injectable()
export class TwilioService {
  private client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );

  public conversations = this.client.conversations;
  public video = this.client.video;

  async createUser(id: string, name: string) {
    return this.conversations.v1.users.create({
      identity: id,
      friendlyName: name,
    });
  }

  async removeUser(id: string) {
    return this.conversations.v1.users(id).remove();
  }

  async findUser(sid: string) {
    return this.client.conversations.v1.users.get(sid);
  }

  async getConversationToken({
    serviceSid,
    identity,
    room,
  }: {
    serviceSid: string;
    identity: string;
    room: string;
  }): Promise<string> {
    const AccessToken = twilio.jwt.AccessToken;
    const ChatGrant = AccessToken.ChatGrant;
    const VideoGrant = AccessToken.VideoGrant;

    const chatGrant = new ChatGrant({
      serviceSid,
    });
    const videoGrant = new VideoGrant({
      room,
    });

    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY_SID,
      process.env.TWILIO_API_KEY_SECRET,
      {
        identity,
      },
    );

    token.addGrant(chatGrant);
    token.addGrant(videoGrant);

    return token.toJwt();
  }
}
