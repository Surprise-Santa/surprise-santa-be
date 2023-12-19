import { PrismaService } from '@@/common/database/prisma/prisma.service';
import { AppUtilities } from '@@/common/utilities';
import { Injectable, NotFoundException } from '@nestjs/common';
import { GroupMemberMapType } from './group-member.maptype';
import { Prisma } from '@prisma/client';
import { CrudService } from '../../common/database/crud.service';

@Injectable()
export class GroupMemberService extends CrudService<
  Prisma.GroupMemberDelegate,
  GroupMemberMapType
> {
  constructor(private prisma: PrismaService) {
    super(prisma.groupMember);
  }

  async getGroupMemberById(memberId: string) {
    const member = await this.prisma.groupMember.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member) throw new NotFoundException('Member not found');

    return AppUtilities.removeSensitiveData(member, 'password');
  }
}
