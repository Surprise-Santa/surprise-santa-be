import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { EventService } from '@@/event/event.service';
import { BullModule } from '@nestjs/bull';
import { QUEUE } from '../common/messaging/interfaces';
import { MessagingQueueProducer } from '../common/messaging/queue/producer';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE })],
  controllers: [GroupController],
  providers: [GroupService, EventService, MessagingQueueProducer],
})
export class GroupModule {}
