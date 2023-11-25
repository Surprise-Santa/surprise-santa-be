import { Injectable, NotAcceptableException } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { CreateEventDto } from './dto/create-event.dto';
import { AppUtilities } from '@@/common/utilities';
import { AddEventParticipantsDto } from './dto/add-event-participants.dto';
import { PrismaService } from '@@/common/database/prisma/prisma.service';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async getEvents(userId: string) {
    return await this.prisma.eventParticipant.findMany({
      where: { userId },
      include: {
        event: true,
      },
    });
  }

  async getEvent(eventId: string, user: User) {
    const event = await this.prisma.eventParticipant.findFirst({
      where: { eventId, userId: user.id },
      include: {
        event: { include: { participants: true } },
      },
    });

    if (!event) throw new NotAcceptableException('Invalid event!');

    return event;
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

    return await this.prisma.event.create({
      data: {
        groupId,
        eventLink,
        ...dto,
      },
    });
  }

  async addEventParticipants(
    eventId: string,
    { participants, all }: AddEventParticipantsDto,
  ) {
    const { group } = await this.prisma.event.findFirst({
      where: { id: eventId },
      select: {
        group: {
          select: {
            id: true,
            members: true,
          },
        },
      },
    });

    const validParticipants = group.members.filter((member) =>
      participants.includes(member.id),
    );

    if (all) {
      const members = await this.prisma.group.findMany({
        where: { id: group.id },
      });

      return await this.prisma.$transaction(async (prisma: PrismaClient) => {
        const promises = members.map((member) =>
          prisma.eventParticipant.create({
            data: { eventId, userId: member.id },
          }),
        );

        return Promise.all(promises);
      });
    }

    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const promises = validParticipants.map((participant) =>
        prisma.eventParticipant.create({
          data: { eventId, userId: participant.id },
        }),
      );

      return Promise.all(promises);
    });
  }
}
