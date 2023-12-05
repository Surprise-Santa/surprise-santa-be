import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import { JwtGuard } from '@@/auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetRequestUser } from '@@/common/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { CreateEventDto } from './dto/create-event.dto';
import { AddEventParticipantsDto } from './dto/add-event-participants.dto';
import { ApiTag } from '@@/common/interfaces';
import { ApiResponseMeta } from '@@/common/decorators/response.decorator';

@ApiTags(ApiTag.EVENT)
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('events')
export class EventController {
  constructor(private eventService: EventService) {}

  @Get()
  async getAllEvents(@GetRequestUser() user: User) {
    return this.eventService.getEvents(user.id);
  }

  @Get('/:id')
  async getEvent(
    @Param('id', ParseUUIDPipe) id: string,
    @GetRequestUser() user: User,
  ) {
    return this.eventService.getEvent(id, user);
  }

  @Post('/create')
  async createEvent(@Body() dto: CreateEventDto, @GetRequestUser() user: User) {
    return this.eventService.createEvent(dto, user);
  }

  @ApiResponseMeta({ message: 'You have joined this event successfully' })
  @Post('/:eventId/join')
  async joinEvent(
    @Param('eventId', ParseUUIDPipe) id: string,
    @GetRequestUser() user: User,
  ) {
    return this.eventService.joinEvent(id, user.id);
  }

  @ApiResponseMeta({ message: 'Added successfully' })
  @Post('/:eventId/add-participants')
  async addParticipants(
    @Param('eventId', ParseUUIDPipe) id: string,
    @Body() dto: AddEventParticipantsDto,
  ) {
    return this.eventService.addEventParticipants(id, dto);
  }

  @Post('/:eventId/get-match')
  async getMatch(
    @Param('eventId', ParseUUIDPipe) id: string,
    @GetRequestUser() user: User,
  ) {
    return this.eventService.pairEventParticipants(id, user.id);
  }
}
