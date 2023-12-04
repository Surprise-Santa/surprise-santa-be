import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/database/prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { Prisma, User } from '@prisma/client';
import { CloudinaryService } from '@@/common/cloudinary/cloudinary.service';
import { AppUtilities } from '../common/utilities';
import { SendEmailInviteDto } from './dto/send-email-invite.dto';
import { MessagingQueueProducer } from '../common/messaging/queue/producer';
import { isUUID } from 'class-validator';

@Injectable()
export class GroupService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private messagingQueue: MessagingQueueProducer,
  ) {}

  async getMyGroups(user: User) {
    const groups = await this.prisma.groupMember.findMany({
      where: {
        userId: user.id,
      },
      select: {
        group: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    const result = groups.map(({ group }) => {
      const transformedMembers = group.members.map(({ user, ...member }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return { ...member, user: userWithoutPassword };
      });

      return { ...group, members: transformedMembers };
    });

    return result;
  }

  async getGroupById(id: string, user: User) {
    const groupMember = await this.prisma.groupMember.findFirst({
      where: { userId: user.id, groupId: id },
    });

    if (!groupMember) throw new ForbiddenException('Cannot view group');

    const group = await this.prisma.group.findFirst({
      where: { id },
      include: {
        members: {
          select: {
            user: true,
          },
        },
      },
    });

    if (!group) throw new NotFoundException('Group not found');

    const groupMembers = group.members.map(({ user, ...member }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return { ...member, user: userWithoutPassword };
    });

    return { ...group, members: groupMembers };
  }

  async getMyCreatedGroups(user: User) {
    const groups = await this.prisma.group.findMany({
      where: { createdBy: user.id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    const result = groups.map(({ members, ...groupData }) => {
      const transformedMembers = members.map(({ user, ...member }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return { ...member, user: userWithoutPassword };
      });

      return {
        ...groupData,
        members: transformedMembers,
      };
    });

    return result;
  }

  async createGroup(
    dto: CreateGroupDto,
    logo: Express.Multer.File,
    user: User,
  ) {
    const foundUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!foundUser) throw new NotFoundException('User not found');

    let groupLink = AppUtilities.generateShortCode(6);
    const existingLink = await this.prisma.group.findUnique({
      where: { groupLink },
    });

    while (existingLink) {
      groupLink = AppUtilities.generateShortCode(6);
    }

    try {
      return await this.prisma.$transaction(async () => {
        const uploadLogo: any = logo
          ? await this.cloudinaryService.uploadLogo(logo, user.id).catch(() => {
              throw new BadRequestException('Invalid file type');
            })
          : null;

        const logosUrl = uploadLogo?.secure_url || '';

        const group = await this.prisma.group.create({
          data: {
            ...dto,
            groupLink,
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

  async joinGroup(id: string, user: User) {
    const findUniqueGroupDto: Prisma.GroupFindUniqueArgs = isUUID(id)
      ? { where: { id } }
      : { where: { groupLink: id } };
    const group = await this.prisma.group.findUnique(findUniqueGroupDto);

    if (!group) throw new NotFoundException('Group not found');

    const existingMember = await this.prisma.groupMember.findFirst({
      where: { groupId: group.id, userId: user.id },
    });

    if (existingMember)
      throw new BadRequestException('You are already a member of this group');

    return await this.prisma.groupMember.create({
      data: {
        userId: user.id,
        groupId: group.id,
      },
      include: { group: { include: { members: true } } },
    });
  }

  async sendGroupInvite(
    id: string,
    { emails }: SendEmailInviteDto,
    user: User,
  ) {
    const isUser = await this.prisma.user.findFirst({
      where: { id: user.id },
    });

    if (!isUser)
      throw new UnauthorizedException('No user found. Please signup or login');

    const group = await this.prisma.group.findFirst({
      where: { id },
      select: {
        name: true,
        groupLink: true,
        members: { select: { user: { select: { email: true } } } },
      },
    });

    if (!group) throw new NotFoundException('This group does not exist');

    const emailsToInvite = emails.filter((email) =>
      group.members.some(({ user }) => user.email !== email),
    );

    const emailsToInvitePromises = emailsToInvite.map((email) =>
      this.messagingQueue.queueGroupInviteEmail({
        email,
        firstName: user.firstName,
        groupName: group.name,
        groupLink: group.groupLink,
      }),
    );
    await Promise.all(emailsToInvitePromises);
  }
}
