import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
  ResetPasswordQuery,
} from './dto/request-password-reset.dto';
import { ApiResponseMeta } from 'src/common/decorators/response.decorator';

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
