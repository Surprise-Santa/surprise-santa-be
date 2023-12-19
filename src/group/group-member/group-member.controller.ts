import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { GroupMemberService } from './group-member.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@@/auth/guard/auth.guard';
import { ApiTag } from '@@/common/interfaces';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@ApiTags(ApiTag.GROUP)
@Controller('/groups/members')
export class GroupMemberController {
  constructor(private readonly groupMemberService: GroupMemberService) {}

  @Get('/:id')
  async getGroupMember(@Param('id', ParseUUIDPipe) id: string) {
    return this.groupMemberService.getGroupMemberById(id);
  }
}
