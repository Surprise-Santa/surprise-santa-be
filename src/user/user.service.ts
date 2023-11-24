import { PrismaService } from '@@/common/database/prisma/prisma.service';
import { Injectable, NotAcceptableException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

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

  async uploadProfilePic(file: Express.Multer.File, user: User) {
    try {
      if (!file) {
        throw new NotAcceptableException('No file was uploaded');
      }
      const { secure_url } = await this.cloudinaryService.uploadProfilePic(
        file,
        user.id,
      );

      const args: Prisma.UserUpdateArgs = {
        where: { id: user.id },
        data: {
          profileImgUrl: secure_url,
        },
      };

      await this.prisma.user.update(args);

      return { message: 'File uploaded successfully' };
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw new NotAcceptableException('Failed to upload profile picture');
    }
  }
}
