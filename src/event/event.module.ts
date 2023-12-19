import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { EventParticipantService } from './participants/event-participant.service';

@Module({
  controllers: [EventController],
  providers: [EventService, EventParticipantService],
  exports: [EventService, EventParticipantService],
})
export class EventModule {}
