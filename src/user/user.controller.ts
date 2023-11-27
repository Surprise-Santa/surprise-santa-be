import { Controller, UseGuards, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/auth.guard';
import { GetRequestUser } from 'src/common/decorators/get-user.decorator';
import { UserService } from './user.service';
import { User } from '@prisma/client';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  async getMyInfo(@GetRequestUser() user: User) {
    return this.userService.getUserInfo(user);
  }
}
