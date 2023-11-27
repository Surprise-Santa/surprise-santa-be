import { Module } from '@nestjs/common';
import { ProfileSettingService } from './profile/profile.service';
import { GroupSettingService } from './group/group.service';
import { EventService } from './event/event.service';
import { SettingsController } from './settings.controller';
import { CloudinaryModule } from '@@/common/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  providers: [ProfileSettingService, GroupSettingService, EventService],
  controllers: [SettingsController],
})
export class SettingsModule {}
