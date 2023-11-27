import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { PrismaService } from '../common/database/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { MailingService } from 'src/common/messaging/mailing/mailing.service';
import { TokenService } from 'src/common/token/token.service';
import { TokenType } from 'src/common/token/interfaces';
import { GoogleStrategy } from './strategy/google.strategy';
import { ClientGoogleRegisterDto } from './dto/client-google-auth.dto';
import { AppUtilities } from '@@/common/utilities';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private googleStrategy: GoogleStrategy,
    private jwt: JwtService,
    private messageService: MailingService,
    private tokenService: TokenService,
  ) {}

  async signup({ password, email, firstName, ...rest }: SignupDto) {
    const hash = await AppUtilities.hashPassword(password);

    try {
      const user = await this.prisma.user.create({
        data: {
          ...rest,
          email,
          firstName,
          password: hash,
        },
      });

      delete user.password;

      this.messageService.sendWelcomeEmail(email, firstName);

      return user;
    } catch (err) {
      if (err.code === 'P2002') {
        throw new ForbiddenException('Email address already exists');
      }
      console.log(err);
      throw err;
    }
  }

  async login({ email, password }: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new UnauthorizedException('User not found');

    const verifyPass = await AppUtilities.comparePasswords(
      password,
      user.password,
    );

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

    const hash = await AppUtilities.hashPassword(newPassword);

    await this.prisma.user.update({
      where: { email: validToken.id },
      data: { password: hash },
    });
  }

  async handleAuthGoogle(req: any) {
    if (req.user) {
      throw new BadRequestException('No google account found!');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: req.user.email },
    });

    return existingUser;
  }

  async clientSocialRegister({ accessToken, ...dto }: ClientGoogleRegisterDto) {
    const googleUser = await this.googleStrategy.clientValidate(accessToken);

    const user: SignupDto = {
      ...dto,
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
      email: googleUser.email,
    };

    const newUser = await this.signup(user);
    const token = await this.signToken(newUser.id, googleUser.email);

    return { token, user: newUser };
  }

  async clientSocialLogin(accessToken: string) {
    const googleUser = await this.googleStrategy.clientValidate(accessToken);

    if (!googleUser)
      throw new NotAcceptableException(
        'Cannot authenticate user. Kindly register with your social account.',
      );

    const existingUser = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!existingUser)
      throw new NotAcceptableException(
        'Cannot authenticate user. Kindly register with your social account.',
      );

    const token = await this.signToken(existingUser.id, googleUser.email);
    delete existingUser.password;

    return { token, user: existingUser };
  }
}
