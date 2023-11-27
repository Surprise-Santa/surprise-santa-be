import { PrismaService } from '@@/common/database/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EditGroupDto } from './dto/edit-group.dto';
import { CloudinaryService } from '@@/common/cloudinary/cloudinary.service';
import { User } from '@prisma/client';
import { GroupLogoDto } from './dto/group-logo.dto';

@Injectable()
export class GroupSettingService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async editGroupInfo({ groupId, isPublic, ...dto }: EditGroupDto, user: User) {
    const userGroup = await this.prisma.group.findFirst({
      where: { id: groupId, createdBy: user.id },
    });

    if (!userGroup) throw new BadRequestException('Cannot edit this group');

    return this.prisma.group.update({
      where: { id: groupId },
      data: {
        ...dto,
        ...(isPublic && { isPublic }),
      },
    });
  }

  async uploadGroupLogo({ logo, groupId }: GroupLogoDto, user: User) {
    const userGroup = await this.prisma.group.findFirst({
      where: { id: groupId, createdBy: user.id },
    });

    if (!userGroup) throw new BadRequestException('Cannot edit this group');

    const { secure_url } = await this.cloudinary
      .uploadLogo(logo, user.id)
      .catch(() => {
        throw new BadRequestException('Invalid file type');
      });

    if (!secure_url) {
      throw new UnprocessableEntityException('Error uploading group logo');
    }

    await this.prisma.group.update({
      where: { id: groupId },
      data: {
        logoUrl: secure_url,
      },
    });
  }
}
