import {
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/database/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { MailingService } from 'src/common/messaging/mailing/mailing.service';
import { TokenService } from 'src/common/token/token.service';
import { TokenType } from 'src/common/token/interfaces';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
    private messageService: MailingService,
    private tokenService: TokenService,
  ) {}

  async signup({ password, ...rest }: SignupDto) {
    const hash = await bcrypt.hash(password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          ...rest,
          password: hash,
        },
      });

      delete user.password;

      return user;
    } catch (err) {
      if (err.code === 'P2002') {
        throw new ForbiddenException('Email address already exists');
      }

      throw err;
    }
  }

  async login({ email, password }: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new UnauthorizedException('User not found');

    const verifyPass = await bcrypt.compare(password, user.password);

    if (!verifyPass) throw new UnauthorizedException('Incorrect Credentials');

    const token = await this.signToken(user.id, user.email);

    delete user.password;

    return {
      token,
      user,
    };
  }

  private async signToken(userId: string, email: string) {
    const payload = { sub: userId, email };
    const secret = this.config.get('jwt.secret');
    const expiresIn = this.config.get('jwt.expiresIn');

    return await this.jwt.signAsync(payload, { secret, expiresIn });
  }

  async requestResetPassword(email: string) {
    const user = await this.prisma.user.findFirst({ where: { email } });

    if (!user) {
      throw new NotAcceptableException('Invalid Email Address');
    }

    const baseUrl = this.config.get('app.baseUrl');
    const token = await this.tokenService.createToken(
      TokenType.RESET_PASS,
      user.email,
    );

    const link = `${baseUrl}/auth/reset-password?token=${token}`;

    return this.messageService.sendResetToken({
      email,
      firstName: user.firstName,
      link,
    });
  }

  async resetPassword(newPassword: string, token: string) {
    const validToken = await this.tokenService.verifyToken(
      TokenType.RESET_PASS,
      token,
    );

    if (!validToken.isValid) {
      throw new NotAcceptableException('Invalid Token');
    }

    const hash = await argon.hash(newPassword);

    await this.prisma.user.update({
      where: { email: validToken.id },
      data: { password: hash },
    });
  }
}
