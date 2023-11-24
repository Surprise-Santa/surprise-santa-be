import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadProfilePicDto } from './dto/upload-profile-pic.dto';
import { JwtGuard } from 'src/auth/guard/auth.guard';
import { GetRequestUser } from 'src/common/decorators/get-user.decorator';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import { AuthService } from '../auth/auth.service';
import { ApiResponseMeta } from '../common/decorators/response.decorator';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Get('/')
  async getMyInfo(@GetRequestUser() user: User) {
    return this.userService.getUserInfo(user);
  }

  @ApiConsumes('multipart/form-data')
  @Post('/profile-pic')
  @UseInterceptors(FileInterceptor('picture'))
  async uploadProfilePic(
    @Body() dto: UploadProfilePicDto,
    @UploadedFile() picture: Express.Multer.File,
    @GetRequestUser() user: User,
  ) {
    return this.userService.uploadProfilePic(picture, user);
  }

  @ApiResponseMeta({ message: 'Password Changed Successfully!' })
  @Post('/change-password')
  async changePassword(
    @GetRequestUser() user: User,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user, dto);
  }
}
