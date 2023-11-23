import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/database/prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { User } from '@prisma/client';
import { CloudinaryService } from '@@/common/cloudinary/cloudinary.service';

@Injectable()
export class GroupService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async getAllGroupss() {
    const groups = await this.prisma.group.findMany();
    return groups;
  }

  async getGroupById(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!group) throw new NotFoundException('Group not found');

    return group;
  }

  async createGroup(
    dto: CreateGroupDto,
    logoUrl: Express.Multer.File,
    user: User,
  ) {
    const foundUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!foundUser) throw new NotFoundException('User not found');

    const uploadLogo: any = logoUrl
      ? await this.cloudinaryService.uploadLogo(logoUrl, user.id).catch(() => {
          throw new BadRequestException('Invalid file type');
        })
      : null;

    const logosUrl = uploadLogo?.secure_url || '';

    try {
      await this.prisma.$transaction(async () => {
        const group = await this.prisma.group.create({
          data: {
            ...dto,
            logoUrl: logosUrl,
            createdBy: user.id,
          },
        });

        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            groups: {
              connect: {
                id: group.id,
              },
            },
          },
        });
        return group;
      });
    } catch (error) {
      console.log(error);
      throw new ServiceUnavailableException('Failed to create group');
    }
  }
}
