import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { signupDto } from './dto/signup.dto';
import { PrismaService } from '../common/database/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup({ password, ...rest }: signupDto) {
    const hash = await argon.hash(password);

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
}
