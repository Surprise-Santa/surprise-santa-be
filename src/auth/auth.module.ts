import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { MailingService } from 'src/common/messaging/mailing/mailing.service';
import { TokenService } from 'src/common/token/token.service';
import { CacheModule } from 'src/common/cache/cache.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, MailingService, TokenService],
  imports: [JwtModule.register({}), CacheModule],
})
export class AuthModule {}
