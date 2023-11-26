import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { EventService } from '@@/event/event.service';

@Module({
  controllers: [GroupController],
  providers: [GroupService, EventService],
})
export class GroupModule {}
