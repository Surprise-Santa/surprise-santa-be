import {
  BadRequestException,
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
import { ConfigService } from '@nestjs/config';
import { CrudService } from '../common/database/crud.service';
import { GroupMapType } from './group.maptype';
import { PaginationSearchOptionsDto } from '../common/database/pagination-search-options.dto';
import { GroupMemberService } from './group-member/group-member.service';
import { FilterGroupDto } from './dto/filter-group.dto';

@Injectable()
export class GroupService extends CrudService<
  Prisma.GroupDelegate,
  GroupMapType
> {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private groupMemberService: GroupMemberService,
    private cloudinaryService: CloudinaryService,
    private messagingQueue: MessagingQueueProducer,
  ) {
    super(prisma.group);
  }

  async getMyGroups(dto: PaginationSearchOptionsDto, user: User) {
    const parsedQueryFilters = this.parseQueryFilter(dto, [
      'name',
      'description',
      'groupCode',
    ]);
    const args: Prisma.GroupFindManyArgs = {
      where: {
        ...parsedQueryFilters,
        members: {
          some: { userId: user.id },
        },
        createdBy: { not: user.id },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        owner: true,
      },
    };
    return this.findManyPaginate(args, dto, (data) => {
      return AppUtilities.removeSensitiveData(data, 'password');
    });
  }

  async getGroupById(id: string, dto: FilterGroupDto, user: User) {
    const group = await this.prisma.group.findUnique({
      where: { id, members: { some: { userId: user.id } } },
    });

    if (!group) throw new NotFoundException('Group not found');

    const parsedQueryFilters = this.parseQueryFilter(dto, [
      'user.firstName',
      'user.middleName',
      'user.lastName',
      'user.email',
      {
        key: 'gender',
        where: (gender) => ({ user: { gender } }),
      },
    ]);
    const groupMemberArgs: Prisma.GroupMemberFindManyArgs = {
      where: {
        ...parsedQueryFilters,
        groupId: id,
      },
      include: { user: true },
    };

    const members = await this.groupMemberService.findManyPaginate(
      groupMemberArgs,
      dto,
      (data) => {
        return AppUtilities.removeSensitiveData(data, 'password');
      },
    );

    if (!members) throw new NotFoundException('Cannot find group members');

    return { ...group, members };
  }

  async getMyCreatedGroups(dto: PaginationSearchOptionsDto, user: User) {
    const parsedQueryFilters = this.parseQueryFilter(dto, [
      'name',
      'description',
      'groupCode',
    ]);
    const args: Prisma.GroupFindManyArgs = {
      where: {
        ...parsedQueryFilters,
        createdBy: user.id,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    };
    return this.findManyPaginate(args, dto, (data) => {
      return AppUtilities.removeSensitiveData(data, 'password');
    });
  }

  async getGroupMembers(groupId: string, dto: FilterGroupDto) {
    const parsedQueryFilters = this.parseQueryFilter(dto, [
      'user.firstName',
      'user.middleName',
      'user.lastName',
      'user.email',
      {
        key: 'gender',
        where: (gender) => ({ user: { gender } }),
      },
    ]);

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) throw new NotFoundException('Group not found');

    const groupMemberArgs: Prisma.GroupMemberFindManyArgs = {
      where: {
        ...parsedQueryFilters,
        groupId,
      },
      include: { user: true, group: true },
    };

    return await this.groupMemberService.findManyPaginate(
      groupMemberArgs,
      dto,
      (data) => {
        return AppUtilities.removeSensitiveData(data, 'password');
      },
    );
  }

  async getGroupDetails(groupCode: string) {
    const group = await this.prisma.group.findUnique({
      where: { groupCode },
      include: {
        owner: { select: { firstName: true, lastName: true } },
        members: { include: { user: true } },
      },
    });

    if (!group) throw new NotFoundException('Group not found');

    return AppUtilities.removeSensitiveData(group, 'password');
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

    let groupCode = AppUtilities.generateShortCode(6);
    const existingLink = await this.prisma.group.findUnique({
      where: { groupCode },
    });

    while (existingLink) {
      groupCode = AppUtilities.generateShortCode(6);
    }

    try {
      return await this.prisma.$transaction(async () => {
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
            groupCode,
            logoUrl: logosUrl,
            owner: { connect: { id: user.id } },
            members: {
              create: {
                user: {
                  connect: { id: user.id },
                },
                isAdmin: true,
              },
            },
          },
          include: {
            members: {
              include: {
                user: true,
              },
            },
            events: true,
          },
        });

        return AppUtilities.removeSensitiveData(group, 'password');
      });
    } catch (error) {
      console.log(error);
      throw new ServiceUnavailableException('Failed to create group');
    }
  }

  async joinGroup(id: string, user: User) {
    const findUniqueGroupDto: Prisma.GroupFindUniqueArgs = isUUID(id)
      ? { where: { id } }
      : { where: { groupCode: id } };
    const group = await this.prisma.group.findUnique(findUniqueGroupDto);

    if (!group) throw new NotFoundException('Group not found');

    const existingMember = await this.prisma.groupMember.findFirst({
      where: { groupId: group.id, userId: user.id },
    });

    if (existingMember)
      throw new BadRequestException('You are already a member of this group');

    const result = await this.prisma.groupMember.create({
      data: {
        userId: user.id,
        groupId: group.id,
      },
      include: {
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

    return AppUtilities.removeSensitiveData(result, 'password');
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
        groupCode: true,
        members: { select: { user: { select: { email: true } } } },
      },
    });

    if (!group) throw new NotFoundException('This group does not exist');

    const emailsToInvite = emails.filter((email) =>
      group.members.some(({ user }) => user.email !== email),
    );

    const baseUrl = this.config.get('app.baseUrl');

    const link = `${baseUrl}/?group=${group.groupCode}`;

    const emailsToInvitePromises = emailsToInvite.map((email) =>
      this.messagingQueue.queueGroupInviteEmail({
        email,
        firstName: user.firstName,
        groupName: group.name,
        groupCode: link,
      }),
    );
    await Promise.all(emailsToInvitePromises);
  }
}
