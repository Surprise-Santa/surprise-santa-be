import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import {
  EventPairing,
  EventParticipant,
  Prisma,
  PrismaClient,
  User,
} from '@prisma/client';
import { CreateEventDto } from './dto/create-event.dto';
import { AppUtilities } from '@@/common/utilities';
import { AddEventParticipantsDto } from './dto/add-event-participants.dto';
import { PrismaService } from '@@/common/database/prisma/prisma.service';
import moment from 'moment';
import { CrudService } from '../common/database/crud.service';
import { EventMapType } from './event.maptype';
import { FilterEventsDto } from './dto/filter-event.dto';
import { EventParticipantService } from './participants/event-participant.service';
import { PaginationSearchOptionsDto } from '../common/database/pagination-search-options.dto';

@Injectable()
export class EventService extends CrudService<
  Prisma.EventDelegate,
  EventMapType
> {
  constructor(
    private prisma: PrismaService,
    private eventParticipantService: EventParticipantService,
  ) {
    super(prisma.event);
  }

  async getEvents(dto: FilterEventsDto, userId: string) {
    const parsedQueryFilters = this.parseQueryFilter(dto, [
      'title',
      'description',
      'eventLink',
      {
        key: 'startDate',
        where: (startDate) => {
          const mStartDate = moment(startDate).startOf('day').toDate();
          return { startDate: { gte: mStartDate } };
        },
      },
      {
        key: 'endDate',
        where: (endDate) => {
          const mEndDate = moment(endDate).endOf('day').toDate();
          return { endDate: { lte: mEndDate } };
        },
      },
    ]);

    const args: Prisma.EventFindManyArgs = {
      where: {
        ...parsedQueryFilters,
        participants: { some: { userId } },
      },
      include: {
        participants: { include: { user: true } },
        organizer: true,
      },
    };
    return this.findManyPaginate(args, dto, (data) =>
      AppUtilities.removeSensitiveData(data, 'password'),
    );
  }

  async getGroupEvents(dto: FilterEventsDto, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) throw new NotFoundException('Group not found');

    const parsedQueryFilters = this.parseQueryFilter(dto, [
      'title',
      'description',
      'eventLink',
      {
        key: 'startDate',
        where: (startDate) => {
          const mStartDate = moment(startDate).startOf('day').toDate();
          return { startDate: { gte: mStartDate } };
        },
      },
      {
        key: 'endDate',
        where: (endDate) => {
          const mEndDate = moment(endDate).endOf('day').toDate();
          return { endDate: { lte: mEndDate } };
        },
      },
    ]);

    const args: Prisma.EventFindManyArgs = {
      where: {
        ...parsedQueryFilters,
        groupId,
      },
      include: {
        participants: { include: { user: true } },
        organizer: true,
      },
    };

    return this.findManyPaginate(args, dto, (data) =>
      AppUtilities.removeSensitiveData(data, 'password'),
    );
  }

  async getEvent(eventId: string, dto: PaginationSearchOptionsDto, user: User) {
    const event = await this.findFirst({
      where: {
        id: eventId,
        participants: { some: { userId: user.id } },
      },
    });

    if (!event) throw new NotFoundException('Event not found');

    const parsedQueryFilters = this.parseQueryFilter(dto, [
      'user.firstName',
      'user.middleName',
      'user.lastName',
      'user.email',
      {
        key: 'gender',
        where: (gender) => ({ user: { gender } }),
      },
    ]);
    const args: Prisma.EventParticipantFindManyArgs = {
      where: {
        ...parsedQueryFilters,
        eventId,
      },
      include: { user: true },
    };
    event.participants = await this.eventParticipantService.findManyPaginate(
      args,
      dto,
      (data) => AppUtilities.removeSensitiveData(data, 'password'),
    );
    return event;
  }

  async getGroupEvent(groupId: string, eventId: string) {
    const groupEvent = await this.prisma.event.findFirst({
      where: { groupId, id: eventId },
      include: { participants: true },
    });

    if (!groupEvent) throw new NotFoundException('Event not found');

    return groupEvent;
  }

  async createEvent({ groupId, ...dto }: CreateEventDto, user: User) {
    const userGroup = await this.prisma.groupMember.findFirst({
      where: { groupId, userId: user.id },
    });

    if (!userGroup)
      throw new NotAcceptableException('Cannot create event for this group!');

    let eventLink = AppUtilities.generateShortCode(6);
    const existingLink = await this.prisma.event.findUnique({
      where: { eventLink },
    });

    while (existingLink) {
      eventLink = AppUtilities.generateShortCode(6);
    }

    const invalidStartDate = moment(dto.startDate).isBefore(Date.now());

    if (invalidStartDate)
      throw new BadRequestException('Event cannot start before today');

    if (dto.endDate) {
      const invalidEndDate = moment(dto.endDate).isSameOrBefore(dto.startDate);

      if (invalidEndDate)
        throw new BadRequestException(
          'Event must end at least 24 hours after start date',
        );
    }

    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const event = await prisma.event.create({
        data: {
          group: { connect: { id: groupId } },
          eventLink,
          organizer: { connect: { id: user.id } },
          ...dto,
        },
      });
      await prisma.eventParticipant.create({
        data: {
          eventId: event.id,
          userId: user.id,
        },
      });

      return event;
    });
  }

  async joinEvent(eventId: string, userId: string) {
    const event = await this.prisma.event.findFirst({
      where: {
        id: eventId,
      },
      select: {
        startDate: true,
        group: {
          select: {
            members: {
              select: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!event) throw new NotFoundException('Event not found');

    const participant = await this.prisma.eventParticipant.findFirst({
      where: {
        eventId,
        userId,
      },
    });

    if (participant)
      throw new ForbiddenException('You have already joined this event');

    const validEvent = event.group.members.find(
      (member) => member.user.id === userId,
    );

    if (!validEvent)
      throw new ForbiddenException(
        'Cannot join this event because you are not a member of the group',
      );

    const eventStarted = moment(Date.now()).isSameOrAfter(event.startDate);

    if (eventStarted)
      throw new ForbiddenException('Cannot join event because it has started');

    await this.prisma.eventParticipant.create({
      data: {
        eventId,
        userId,
      },
    });
  }

  async addEventParticipants(
    eventId: string,
    { participants, all }: AddEventParticipantsDto,
  ) {
    const event = await this.prisma.event.findFirst({
      where: {
        id: eventId,
      },
      select: {
        group: {
          select: {
            members: {
              select: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!event) throw new NotFoundException('Event not found');

    const groupMembers = event.group.members.map((member) => ({
      id: member.user.id,
    }));

    if (all) {
      await this.prisma.eventParticipant.createMany({
        data: groupMembers.map((member) => ({ eventId, userId: member.id })),
        skipDuplicates: true,
      });
    }

    const validParticipants = groupMembers.filter((member) =>
      participants.includes(member.id),
    );

    await this.prisma.eventParticipant.createMany({
      data: validParticipants.map((participant) => ({
        eventId,
        userId: participant.id,
      })),
      skipDuplicates: true,
    });
  }

  async getEventPairing(
    eventId: string,
    userId: string,
    prisma?: PrismaClient,
  ) {
    const prismaClient = prisma ?? this.prisma;
    const currentTime = moment.utc().toDate();

    const event = await prismaClient.event.findFirst({
      where: {
        startDate: { lte: currentTime },
        id: eventId,
      },
      include: {
        pairs: {
          where: {
            eventId,
            donorId: userId,
          },
          include: {
            donor: true,
            beneficiary: true,
          },
        },
      },
    });

    if (!event)
      throw new NotFoundException(
        'The event has either been removed or has not yet started. Please contact your administrator.',
      );

    return event?.pairs[0]
      ? AppUtilities.removeSensitiveData(event.pairs[0], 'password')
      : null;
  }

  async pairEventParticipants(eventId: string, userId: string) {
    const eventPair = await this.getEventPairing(eventId, userId);

    if (eventPair) return eventPair;

    const eventParticipants = await this.prisma.eventParticipant.findMany({
      where: { eventId },
    });

    const eventParticipant = eventParticipants.find(
      (participant) => participant.userId === userId,
    );

    if (!eventParticipant) throw new NotAcceptableException();

    const MAX_RETRIES = eventParticipants.length;
    let retries = 0;
    let match: EventPairing;
    while (retries < MAX_RETRIES) {
      try {
        match = await this.prisma.$transaction(
          async (prisma: PrismaClient) => {
            const match = this.createEventBeneficiary(
              eventParticipant,
              eventParticipants,
            );

            return await prisma.eventPairing.create({
              data: {
                beneficiaryId: match.userId,
                donorId: userId,
                eventId,
              },
              include: {
                donor: true,
                beneficiary: true,
              },
            });
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
        );
        break;
      } catch (error) {
        if (error.code === 'P2034') {
          retries++;
          continue;
        }
        throw error;
      }
    }
    return AppUtilities.removeSensitiveData(match, 'password');
  }

  private createEventBeneficiary(
    { userId }: EventParticipant,
    eventParticipants: EventParticipant[],
  ): EventParticipant {
    let beneficiary: EventParticipant;
    do {
      beneficiary =
        eventParticipants[Math.floor(Math.random() * eventParticipants.length)];
    } while (beneficiary.userId === userId);

    return beneficiary;
  }
}
