import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { JOBS, QUEUE } from '../interfaces';
import { JobOptions, Queue } from 'bull';
import {
  IGroupInviteEmail,
  IResetPassword,
  IWelcomeEmail,
} from '../mailing/interfaces';

@Injectable()
export class MessagingQueueProducer {
  constructor(
    @InjectQueue(QUEUE)
    private readonly messagingQueue: Queue,
  ) {}

  async queueGroupInviteEmail(data: IGroupInviteEmail) {
    await this.addToQueue(JOBS.QUEUE_GROUP_INVITE_EMAIL, data, {
      removeOnComplete: true,
    });
  }

  async queueResetTokenEmail(data: IResetPassword) {
    await this.addToQueue(JOBS.QUEUE_RESET_TOKEN_EMAIL, data, {
      removeOnComplete: true,
    });
  }

  async queueWelcomeEmail(data: IWelcomeEmail) {
    await this.addToQueue(JOBS.QUEUE_WELCOME_EMAIL, data, {
      removeOnComplete: true,
    });
  }

  private async addToQueue(jobName: JOBS, data: any, opts?: JobOptions) {
    return this.messagingQueue.add(jobName, data, opts);
  }
}
