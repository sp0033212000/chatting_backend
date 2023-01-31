import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class GoogleService {
  public readonly oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  );

  public readonly googleAPIs = google;
  // public readonly oauth2ClientIOS = new google.auth.OAuth2(
  //   process.env.GOOGLE_CLIENT_ID_IOS,
  // );
  // public readonly oauth2 = google.oauth2({
  //   auth: this.oauth2Client,
  //   version: 'v2',
  // });
  // public readonly storage: Storage;
  // private readonly assetsBucket: Bucket;
  // private SERVICE_ACCOUNT_GCS = {
  //   product_id: process.env.SERVICE_ACCOUNT_PROJECT,
  //   client_email: process.env.SERVICE_ACCOUNT_GCS_EMAIL,
  //   private_key: "",
  // };

  // constructor() {
  //   this.storage = new Storage({
  //     credentials: this.SERVICE_ACCOUNT_GCS,
  //   });
  //   this.assetsBucket = this.storage.bucket('funwoo-assets');
  // }
  //
  // getGoogleAssetBucket() {
  //   return this.assetsBucket;
  // }
}
