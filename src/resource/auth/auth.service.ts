import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { GoogleService } from '../../service/google/google.service';
import { IssueGoogleOAuthEntity } from './entities/issue-google-o-auth.entity';
import { ValidGoogleOAuthDto } from './dto/valid-google-o-auth.dto';
import { UserService } from '../../service/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ValidGoogleOAuthEntity } from './entities/valid-google-o-auth.entity';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { UserProfileEntity } from './entities/user-profile.entity';
import { clone } from 'lodash';
import { add } from 'date-fns';
import { UserAuthIssuer } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly googleClient: GoogleService,
    private readonly userServices: UserService,
    private readonly jwtServices: JwtService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async getUserProfile(): Promise<UserProfileEntity> {
    const user = await this.userServices.getUser();

    if (!user)
      throw new HttpException('User not found.', HttpStatus.UNAUTHORIZED);

    const cloned = clone(user);
    delete cloned.accessToken;
    delete cloned.issuerToken;
    return cloned;
  }

  issueGoogleOAuth(redirectUri: string): IssueGoogleOAuthEntity {
    const url = this.googleClient.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope:
        'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
      redirect_uri: redirectUri,
      prompt: 'consent',
    });

    return {
      authURL: url,
    };
  }

  async validGoogleOAuth({
    code,
    redirect_url,
  }: ValidGoogleOAuthDto): Promise<ValidGoogleOAuthEntity> {
    const oAuthClient = this.googleClient.oauth2Client;
    const oAuth2 = this.googleClient.googleAPIs.oauth2({
      auth: oAuthClient,
      version: 'v2',
    });

    try {
      const { tokens } = await oAuthClient.getToken({
        code,
        redirect_uri: redirect_url,
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
      });
      oAuthClient.setCredentials(tokens);
      const {
        data: { email, id, name, picture },
      } = await oAuth2.userinfo.get();

      if (!email || !id)
        throw new HttpException(
          {
            code: HttpStatus.UNAUTHORIZED,
            messages: ['Missing google user info.'],
          },
          HttpStatus.UNAUTHORIZED,
        );

      const user = await this.userServices.findUnique({ where: { email } });
      const accessToken = this.jwtServices.sign(
        {
          email,
          name,
          time: new Date().getTime(),
          application: 'chatting',
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: parseInt(
            `${add(new Date(), { months: 1 }).getTime() / 1000}`,
          ),
        },
      );

      if (!user) {
        throw new HttpException(
          {
            code: HttpStatus.UNAUTHORIZED,
            messages: ['Missing google user info.'],
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      await this.userServices.updateUser({
        where: { id: user.id },
        data: {
          accessToken,
          name,
          pictureUrl: picture,
          issuer: UserAuthIssuer.GOOGLE,
          issuerToken: tokens.access_token,
        },
      });

      return {
        accessToken,
      };
    } catch (e) {
      throw new HttpException(
        { code: HttpStatus.UNAUTHORIZED, messages: [e] },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
