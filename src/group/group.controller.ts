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
  Query,
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
import { PaginationSearchOptionsDto } from '../common/database/pagination-search-options.dto';
import { FilterGroupDto } from './dto/filter-group.dto';
import { FilterEventsDto } from '../event/dto/filter-event.dto';
import { Public } from '@@/common/decorators/auth.public.decorator';

@ApiTags(ApiTag.GROUP)
@UseGuards(JwtGuard)
@Controller('groups')
export class GroupController {
  constructor(
    private groupService: GroupService,
    private eventService: EventService,
  ) {}

  @ApiBearerAuth()
  @Get('/my-groups')
  async getMyGroups(
    @Query() dto: PaginationSearchOptionsDto,
    @GetRequestUser() user: User,
  ) {
    return await this.groupService.getMyGroups(dto, user);
  }

  @ApiBearerAuth()
  @Get('/own-groups')
  async getMyCreatedGroups(
    @Query() dto: PaginationSearchOptionsDto,
    @GetRequestUser() user: User,
  ) {
    return await this.groupService.getMyCreatedGroups(dto, user);
  }

  @ApiBearerAuth()
  @Get('/:id/events')
  async getGroupEvents(
    @Query() dto: FilterEventsDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.eventService.getGroupEvents(dto, id);
  }

  @ApiBearerAuth()
  @Get('/:id/members')
  async getGroupMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() dto: PaginationSearchOptionsDto,
  ) {
    return await this.groupService.getGroupMembers(id, dto);
  }

  @Public()
  @Get('/:groupCode/details')
  async getGroupDetails(@Param('groupCode') groupCode: string) {
    return await this.groupService.getGroupDetails(groupCode);
  }

  @ApiBearerAuth()
  @Get('/:id')
  async getGroupById(
    @Query() dto: FilterGroupDto,
    @Param('id', ParseUUIDPipe) id: string,
    @GetRequestUser() user: User,
  ) {
    return await this.groupService.getGroupById(id, dto, user);
  }

  @ApiBearerAuth()
  @Get('/:id/events/:eventId')
  async getGroupEvent(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.eventService.getGroupEvent(id, eventId);
  }

  @ApiBearerAuth()
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

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @Post('/create')
  @UseInterceptors(FileInterceptor('logoUrl'))
  async createGroup(
    @Body() dto: CreateGroupDto,
    @UploadedFile() logoUrl: Express.Multer.File,
    @GetRequestUser() user: User,
  ) {
    return this.groupService.createGroup(dto, logoUrl, user);
  }

  @ApiBearerAuth()
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
