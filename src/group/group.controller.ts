import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { GroupService } from './group.service';
import { GetRequestUser } from '@@/common/decorators/get-user.decorator';
import { CreateGroupDto } from './dto/create-group.dto';
import { JwtGuard } from '@@/auth/guard/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';

@ApiBearerAuth()
@Controller('group')
export class GroupController {
  constructor(private groupService: GroupService) {}

  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtGuard)
  @Post('/')
  @UseInterceptors(FileInterceptor('logoUrl'))
  async createGroup(
    @Body() dto: CreateGroupDto,
    @UploadedFile() logoUrl: Express.Multer.File,
    @GetRequestUser() user: User,
  ) {
    return this.groupService.createGroup(dto, logoUrl, user);
  }
}
