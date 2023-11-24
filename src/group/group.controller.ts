import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  Get,
  UseInterceptors,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { GroupService } from './group.service';
import { GetRequestUser } from '@@/common/decorators/get-user.decorator';
import { CreateGroupDto } from './dto/create-group.dto';
import { JwtGuard } from '@@/auth/guard/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { ApiTag } from '@@/common/interfaces';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@ApiTags(ApiTag.GROUP)
@Controller('group')
export class GroupController {
  constructor(private groupService: GroupService) {}

  @Get('/my-groups')
  async getMyGroups(@GetRequestUser() user: User) {
    return await this.groupService.getMyGroups(user);
  }

  @Get('/my-created-groups')
  async getMyCreatedGroups(@GetRequestUser() user: User) {
    return await this.groupService.getMyCreatedGroups(user);
  }

  @Get('/:id')
  async getGroupById(
    @Param('id', ParseUUIDPipe) id: string,
    @GetRequestUser() user: User,
  ) {
    return await this.groupService.getGroupById(id, user);
  }

  @Post('/:id/join')
  async joinGroup(
    @Param('id', ParseUUIDPipe) id: string,
    @GetRequestUser() user: User,
  ) {
    return this.groupService.joinGroup(id, user);
  }

  @ApiConsumes('multipart/form-data')
  @Post('/')
  @UseInterceptors(FileInterceptor('logoUrl'))
  async createGroup(
    @Body() dto: CreateGroupDto,
    @UploadedFile() logoUrl: Express.Multer.File,
    @GetRequestUser() user: User,
  ) {
    return this.groupService.createGroup(dto, logoUrl, user);
  }
}
