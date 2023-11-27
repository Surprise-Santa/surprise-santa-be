import { PrismaService } from '@@/common/database/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { EditEventDto } from './dto/edit-event.dto';
import moment from 'moment';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async editEvent(
    { eventId, startDate, endDate, ...dto }: EditEventDto,
    user: User,
  ) {
    const validEvent = await this.prisma.event.findFirst({
      where: { id: eventId, createdBy: user.id },
    });

    if (!validEvent) throw new BadRequestException('Cannot edit this event');

    if (startDate) {
      const validStartDate = moment(startDate).isSameOrAfter(Date.now());

      if (!validStartDate)
        throw new BadRequestException('Event cannot start before today');
    }

    if (endDate) {
      const eventStart = startDate || validEvent.startDate;
      const invalidEndDate = moment(endDate).isSameOrBefore(eventStart);

      if (invalidEndDate)
        throw new BadRequestException(
          'Event must end at least 24 hours after start date',
        );
    }

    await this.prisma.event.update({
      where: { id: eventId },
      data: {
        ...dto,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      },
    });
  }
}
