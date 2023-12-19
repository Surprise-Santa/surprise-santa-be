import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { EventService } from '@@/event/event.service';
import { BullModule } from '@nestjs/bull';
import { QUEUE } from '../common/messaging/interfaces';
import { MessagingQueueProducer } from '../common/messaging/queue/producer';
import { GroupMemberService } from './group-member/group-member.service';
import { GroupMemberController } from './group-member/group-member.controller';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE })],
  controllers: [GroupController, GroupMemberController],
  providers: [
    GroupService,
    GroupMemberService,
    EventService,
    MessagingQueueProducer,
  ],
})
export class GroupModule {}
