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
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { GroupService } from './group.service';
import { GetRequestUser } from '@@/common/decorators/get-user.decorator';
import { CreateGroupDto } from './dto/create-group.dto';
import { JwtGuard } from '@@/auth/guard/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { ApiTag } from '@@/common/interfaces';
import { ApiResponseMeta } from '@@/common/decorators/response.decorator';
import { EventService } from '@@/event/event.service';
import { SendEmailInviteDto } from './dto/send-email-invite.dto';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@ApiTags(ApiTag.GROUP)
@Controller('groups')
export class GroupController {
  constructor(
    private groupService: GroupService,
    private eventService: EventService,
  ) {}

  @Get('/my-groups')
  async getMyGroups(@GetRequestUser() user: User) {
    return await this.groupService.getMyGroups(user);
  }

  @Get('/own-groups')
  async getMyCreatedGroups(@GetRequestUser() user: User) {
    return await this.groupService.getMyCreatedGroups(user);
  }

  @Get('/:id/events')
  async getGroupEvents(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventService.getGroupEvents(id);
  }

  @Get('/:id')
  async getGroupById(
    @Param('id', ParseUUIDPipe) id: string,
    @GetRequestUser() user: User,
  ) {
    return await this.groupService.getGroupById(id, user);
  }

  @Get('/:id/events/:eventId')
  async getGroupEvent(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.eventService.getGroupEvent(id, eventId);
  }

  @ApiResponseMeta({ message: 'Successfully joined the group' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Group ID or link (shortcode)',
  })
  @Post('/:id/join')
  async joinGroup(@Param('id') id: string, @GetRequestUser() user: User) {
    return this.groupService.joinGroup(id, user);
  }

  @ApiConsumes('multipart/form-data')
  @Post('/create')
  @UseInterceptors(FileInterceptor('logo'))
  async createGroup(
    @Body() dto: CreateGroupDto,
    @UploadedFile() logo: Express.Multer.File,
    @GetRequestUser() user: User,
  ) {
    return this.groupService.createGroup(dto, logo, user);
  }

  @ApiResponseMeta({ message: 'Email invite sent successfully' })
  @Post('/:id/email-invite')
  async SendEmailInvite(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendEmailInviteDto,
    @GetRequestUser() user: User,
  ) {
    return this.groupService.sendGroupInvite(id, dto, user);
  }
}
