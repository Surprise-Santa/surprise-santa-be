import { Module } from '@nestjs/common';
import { GroupMemberService } from './group-member.service';
import { GroupMemberController } from './group-member.controller';

@Module({
  controllers: [GroupMemberController],
  providers: [GroupMemberService],
})
export class GroupMemberModule {}
