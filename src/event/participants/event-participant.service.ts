import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@@/common/database/prisma/prisma.service';
import { CrudService } from '../../common/database/crud.service';
import { EventParticipantMapType } from './event-participant.maptype';

@Injectable()
export class EventParticipantService extends CrudService<
  Prisma.EventParticipantDelegate,
  EventParticipantMapType
> {
  constructor(private prisma: PrismaService) {
    super(prisma.eventParticipant);
  }
}
