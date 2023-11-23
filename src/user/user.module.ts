import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { PrismaService } from '@@/common/database/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [CloudinaryModule, AuthModule],
  controllers: [UserController],
  providers: [UserService, CloudinaryService, PrismaService],
  exports: [UserService, CloudinaryService],
})
export class UserModule {}
