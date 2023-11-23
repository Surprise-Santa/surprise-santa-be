import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [UserController],
  providers: [UserService, CloudinaryService],
  exports: [UserService, CloudinaryService],
})
export class UserModule {}
