import { Module } from '@nestjs/common';
import { MailingService } from './mailing/mailing.service';
import { MailingModule } from './mailing/mailing.module';
import { MessagingController } from './messaging.controller';

@Module({
  imports: [MailingModule],
  providers: [MailingService],
  exports: [MailingService],
  controllers: [MessagingController],
})
export class MessagingModule {}
