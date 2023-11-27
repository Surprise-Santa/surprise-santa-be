import { EventService } from './event/event.service';
import { GroupSettingService } from './group/group.service';
import {
  Body,
  Controller,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileSettingService } from './profile/profile.service';
import {
  ProfilePicDto,
  ProfileSettingDto,
} from './profile/dto/profile-setting.dto';
import { GetRequestUser } from '@@/common/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { ApiResponseMeta } from '@@/common/decorators/response.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ChangePasswordDto } from '@@/auth/dto/change-password.dto';
import { ApiTag } from '@@/common/interfaces';
import { JwtGuard } from '@@/auth/guard/auth.guard';
import { EditGroupDto } from './group/dto/edit-group.dto';
import { GroupLogoDto } from './group/dto/group-logo.dto';
import { EditEventDto } from './event/dto/edit-event.dto';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@ApiTags(ApiTag.SETTING)
@Controller('settings')
export class SettingsController {
  constructor(
    private eventSettings: EventService,
    private groupSettings: GroupSettingService,
    private profileSettings: ProfileSettingService,
  ) {}

  @ApiResponseMeta({ message: 'Profile updated successfully' })
  @Patch('/profile/edit-profile')
  async updateProfile(
    @Body() dto: ProfileSettingDto,
    @GetRequestUser() user: User,
  ) {
    return this.profileSettings.updateUserprofile(dto, user);
  }

  @ApiConsumes('multipart/form-data')
  @Post('/profile/upload-profile-photo')
  @UseInterceptors(FileInterceptor('profilePic'))
  async uploadProfilePic(
    @Body() dto: ProfilePicDto,
    @UploadedFile() profilePic: Express.Multer.File,
    @GetRequestUser() user: User,
  ) {
    return this.profileSettings.uploadProfilePic(profilePic, user);
  }

  @ApiResponseMeta({ message: 'Password changed successfully' })
  @Patch('/profile/change-password')
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @GetRequestUser() user: User,
  ) {
    return this.profileSettings.changePassword(user, dto);
  }

  @ApiResponseMeta({ message: 'Group details updated successfully' })
  @Patch('/group/edit-group')
  async editGroup(@Body() dto: EditGroupDto, @GetRequestUser() user: User) {
    return this.groupSettings.editGroupInfo(dto, user);
  }

  @ApiResponseMeta({ message: 'Logo uploaded successfully' })
  @ApiConsumes('multipart/form-data')
  @Post('/group/upload-group-logo')
  @UseInterceptors(FileInterceptor('logo'))
  async uploadGroupLogo(
    @Body() dto: GroupLogoDto,
    @UploadedFile() logo: Express.Multer.File,
    @GetRequestUser() user: User,
  ) {
    return this.profileSettings.uploadProfilePic(logo, user);
  }

  @ApiResponseMeta({ message: 'Event details updated successfully' })
  @Patch('/event/edit-event')
  async editEvent(@Body() dto: EditEventDto, @GetRequestUser() user: User) {
    return this.eventSettings.editEvent(dto, user);
  }
}
