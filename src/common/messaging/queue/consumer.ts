import { Logger } from '@nestjs/common';
import { QueueProcessor } from '../../interfaces/queue';
import { MailingService } from '../mailing/mailing.service';
import { Job } from 'bull';
import {
  IGroupInviteEmail,
  IResetPassword,
  IWelcomeEmail,
} from '../mailing/interfaces';
import { Process, Processor } from '@nestjs/bull';
import { JOBS, QUEUE } from '../interfaces';

@Processor(QUEUE)
export class MessagingQueueConsumer extends QueueProcessor {
  protected logger: Logger;

  constructor(private mailingService: MailingService) {
    super();
    this.logger = new Logger(MessagingQueueConsumer.name);
  }

  @Process({ name: JOBS.QUEUE_GROUP_INVITE_EMAIL })
  async queueGroupInviteEmail({ data }: Job<IGroupInviteEmail>) {
    await this.mailingService.sendGroupEmailInvite(data);
  }

  @Process({ name: JOBS.QUEUE_RESET_TOKEN_EMAIL })
  async queueResetTokenEmail({ data }: Job<IResetPassword>) {
    await this.mailingService.sendResetToken(data);
  }

  @Process({ name: JOBS.QUEUE_WELCOME_EMAIL })
  async queueSendWelcomeEmail({ data }: Job<IWelcomeEmail>) {
    await this.mailingService.sendWelcomeEmail(data);
  }
}
