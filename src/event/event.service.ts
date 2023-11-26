import {
  ForbiddenException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { CreateEventDto } from './dto/create-event.dto';
import { AppUtilities } from '@@/common/utilities';
import { AddEventParticipantsDto } from './dto/add-event-participants.dto';
import { PrismaService } from '@@/common/database/prisma/prisma.service';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async getEvents(userId: string) {
    const events = await this.prisma.eventParticipant.findMany({
      where: { userId },
      select: {
        event: true,
      },
    });

    return events.map((event) => event.event);
  }

  async getGroupEvents(groupId: string) {
    return await this.prisma.event.findMany({ where: { groupId } });
  }

  async getEvent(eventId: string, user: User) {
    const event = await this.prisma.eventParticipant.findFirst({
      where: { eventId, userId: user.id },
      select: {
        event: { include: { participants: true } },
      },
    });

    if (!event) throw new NotAcceptableException('Invalid event!');

    return event;
  }

  async getGroupEvent(groupId: string, eventId: string) {
    return this.prisma.event.findFirst({ where: { groupId, id: eventId } });
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

    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const event = await prisma.event.create({
        data: {
          groupId,
          eventLink,
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

  async joinGroup(eventId: string, userId: string) {
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

    const validEvent = event.group.members.find(
      (member) => member.user.id === userId,
    );

    if (!validEvent) throw new ForbiddenException('Cannot join this event');

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
}
