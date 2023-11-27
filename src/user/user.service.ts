import { PrismaService } from '@@/common/database/prisma/prisma.service';
import { Injectable, NotAcceptableException } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserInfo(user: User) {
    const foundUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        groups: {
          include: { group: true },
        },
        ownGroups: true,
      },
    });

    if (!foundUser) throw new NotAcceptableException('User not found');

    delete foundUser.password;
    return foundUser;
  }
}
