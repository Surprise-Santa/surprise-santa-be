import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/database/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
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

  // JWT Sign token
  private async signToken(userId: string, email: string) {
    const payload = { sub: userId, email };
    const secret = this.config.get('JWT_SECRET');
    const expiresIn = this.config.get('JWT_EXPIRES_IN');

    return await this.jwt.signAsync(payload, { secret, expiresIn });
  }
}
