import { PrismaService } from '@@/common/database/prisma/prisma.service';
import { AppUtilities } from '@@/common/utilities';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class GroupMemberService {
  constructor(private prisma: PrismaService) {}

  async getGroupMemberById(memberId: string) {
    const member = await this.prisma.groupMember.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member) throw new NotFoundException('Member not found');

    return AppUtilities.removeSensitiveData(member, 'password', true);
  }
}
