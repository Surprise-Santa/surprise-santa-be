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

  async getMyGroups(user: User) {
    const groups = await this.prisma.groupMember.findMany({
      where: {
        userId: user.id,
      },
      include: { group: { include: { members: true } } },
    });
    return groups;
  }

  async getGroupById(id: string, user: User) {
    const group = await this.prisma.groupMember.findFirstOrThrow({
      where: { userId: user.id },
      include: { group: true },
    });

    return group;
  }

  async getMyCreatedGroups(user: User) {
    const groups = await this.prisma.group.findMany({
      where: { createdBy: user.id },
      include: { members: true, events: true },
    });

    return groups;
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

    try {
      await this.prisma.$transaction(async () => {
        const uploadLogo: any = logoUrl
          ? await this.cloudinaryService
              .uploadLogo(logoUrl, user.id)
              .catch(() => {
                throw new BadRequestException('Invalid file type');
              })
          : null;

        const logosUrl = uploadLogo?.secure_url || '';

        const group = await this.prisma.group.create({
          data: {
            ...dto,
            logoUrl: logosUrl,
            owner: { connect: { id: user.id } },
            members: { create: { user: { connect: { id: user.id } } } },
          },
          include: { members: true, events: true },
        });

        return group;
      });
    } catch (error) {
      console.log(error);
      throw new ServiceUnavailableException('Failed to create group');
    }
  }
  catch(error) {
    console.log(error);
    throw new ServiceUnavailableException('Failed to create group');
  }

  async joinGroup(id: string, user: User) {
    const group = await this.prisma.group.findUniqueOrThrow({
      where: { id },
    });

    // check if user already belongs to the group
    const groupMember = await this.prisma.groupMember.findFirst({
      where: { groupId: group.id, userId: user.id },
    });

    if (groupMember)
      throw new BadRequestException('You already belong to this group');

    // create the user in the group as a member
    return await this.prisma.group.update({
      where: { id },
      data: {
        members: { create: { user: { connect: { id: user.id } } } },
      },
    });
  }
}
