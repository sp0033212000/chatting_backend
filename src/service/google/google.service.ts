import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class GoogleService {
  public readonly oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  );

  public readonly googleAPIs = google;
}
