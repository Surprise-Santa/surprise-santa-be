import { ChangePasswordDto } from '@@/auth/dto/change-password.dto';
import { PrismaService } from '@@/common/database/prisma/prisma.service';
import { AppUtilities } from '@@/common/utilities';
import {
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { ProfileSettingDto } from './dto/profile-setting.dto';
import { CloudinaryService } from '@@/common/cloudinary/cloudinary.service';

@Injectable()
export class ProfileSettingService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async updateUserprofile(dto: ProfileSettingDto, user: User) {
    return this.prisma.user.update({
      where: { id: user.id },
      data: dto,
    });
  }

  async changePassword(
    { id }: User,
    { currentPassword, newPassword }: ChangePasswordDto,
  ) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) throw new UnauthorizedException('User not found');

      const isPassMatch = await AppUtilities.comparePasswords(
        currentPassword,
        user.password,
      );

      if (!isPassMatch) throw new ForbiddenException('Incorrect password');

      const hash = await AppUtilities.hashPassword(newPassword);

      await this.prisma.user.update({
        where: { id },
        data: { password: hash },
      });
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }
  }

  async uploadProfilePic(file: Express.Multer.File, user: User) {
    try {
      if (!file) {
        throw new NotAcceptableException('No file was uploaded');
      }
      const { secure_url } = await this.cloudinary.uploadProfilePic(
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

      return { message: 'Profile picture updated successfully' };
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw new NotAcceptableException('Failed to upload profile picture');
    }
  }
}
