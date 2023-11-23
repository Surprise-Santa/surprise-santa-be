import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadProfilePicDto } from './dto/upload-profile-pic.dto';
import { JwtGuard } from 'src/auth/guard/auth.guard';
import { GetRequestUser } from 'src/common/decorators/get-user.decorator';
import { UserService } from './user.service';
import { User } from '@prisma/client';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtGuard)
  @Post('/profile-pic')
  @UseInterceptors(FileInterceptor('picture'))
  async uploadProfilePic(
    @Body() dto: UploadProfilePicDto,
    @UploadedFile() picture: Express.Multer.File,
    @GetRequestUser() user: User,
  ) {
    return this.userService.uploadProfilePic(picture, user);
  }
}
