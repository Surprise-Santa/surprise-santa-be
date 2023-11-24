import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
  ResetPasswordQuery,
} from './dto/request-password-reset.dto';
import { ApiResponseMeta } from 'src/common/decorators/response.decorator';
import { GoogleGuard } from './guard/google.guard';
import {
  ClientGoogleLoginDto,
  ClientGoogleRegisterDto,
} from './dto/client-google-auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('/login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('/google')
  @UseGuards(GoogleGuard)
  async googleAuth() {}

  @Get('/google/callback')
  @UseGuards(GoogleGuard)
  async handleGoogleAuth(@Request() req: any) {
    return this.authService.handleAuthGoogle(req);
  }

  @ApiOperation({ summary: 'log in with google' })
  @Post('/login/social-auth')
  async clientSocialSignin(@Body() dto: ClientGoogleLoginDto) {
    return this.authService.clientSocialLogin(dto.accessToken);
  }

  @ApiOperation({ summary: 'Sign up with google' })
  @Post('/signup/social-auth')
  async clientSocialSignup(@Body() dto: ClientGoogleRegisterDto) {
    return this.authService.clientSocialRegister(dto);
  }

  @ApiResponseMeta({ message: 'Password Reset Link Sent!' })
  @Post('/request-password-reset')
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestResetPassword(dto.email);
  }

  @ApiResponseMeta({ message: 'Password Reset Successfully!' })
  @Post('/password-reset')
  async passwordReset(
    @Query() { token }: ResetPasswordQuery,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(dto.newPassword, token);
  }
}
