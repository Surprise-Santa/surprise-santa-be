import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { EventService } from '@@/event/event.service';
import { MailingService } from '../common/messaging/mailing/mailing.service';

@Module({
  controllers: [GroupController],
  providers: [GroupService, EventService, MailingService],
})
export class GroupModule {}
