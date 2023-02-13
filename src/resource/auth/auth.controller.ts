import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ValidGoogleOAuthDto } from './dto/valid-google-o-auth.dto';
import { IssueGoogleOAuthEntity } from './entities/issue-google-o-auth.entity';
import { ValidGoogleOAuthEntity } from './entities/valid-google-o-auth.entity';
import { UserProfileEntity } from './entities/user-profile.entity';
import { AuthGuard } from '../../auth.guard';

@ApiTags('AuthApi')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('me')
  @ApiOkResponse({ type: UserProfileEntity })
  @ApiOperation({ summary: 'getUserProfile 取得user profile' })
  getUserProfile(): Promise<UserProfileEntity> {
    return this.authService.getUserProfile();
  }

  @Get('google/issue')
  @ApiOkResponse({ type: IssueGoogleOAuthEntity })
  @ApiOperation({ summary: 'issueGoogleOAuth 取得redirectUri' })
  issueGoogleOAuth(
    @Query('redirectUri') redirectUri: string,
  ): IssueGoogleOAuthEntity {
    return this.authService.issueGoogleOAuth(redirectUri);
  }

  @Post('google/valid')
  @ApiOkResponse({ type: ValidGoogleOAuthEntity })
  @ApiOperation({ summary: 'validGoogleOAuth 驗證google oauth' })
  validGoogleOAuth(
    @Body() body: ValidGoogleOAuthDto,
  ): Promise<ValidGoogleOAuthEntity> {
    return this.authService.validGoogleOAuth(body);
  }
}
