import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma/prisma.service';
import moment from 'moment';

@Injectable()
export class SchedulerService {
  protected logger: Logger;
  constructor(private prisma: PrismaService) {
    this.logger = new Logger();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async changeEventStatusToActive() {
    const today = moment();

    await this.prisma.event.updateMany({
      where: {
        startDate: {
          lte: today.toISOString(),
        },
        isActive: false,
      },
      data: {
        isActive: true,
      },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async changeEventStatusToInactive() {
    const today = moment();

    await this.prisma.event.updateMany({
      where: {
        endDate: {
          lte: today.toISOString(),
        },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });
  }
}
