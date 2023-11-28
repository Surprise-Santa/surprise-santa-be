import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { MailingService } from 'src/common/messaging/mailing/mailing.service';
import { TokenService } from 'src/common/token/token.service';
import { CacheModule } from 'src/common/cache/cache.module';
import { GoogleStrategy } from './strategy/google.strategy';
import { MessagingQueueProducer } from '../common/messaging/queue/producer';
import { MessagingQueueConsumer } from '../common/messaging/queue/consumer';
import { BullModule } from '@nestjs/bull';
import { QUEUE } from '../common/messaging/interfaces';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    MailingService,
    TokenService,
    MessagingQueueConsumer,
    MessagingQueueProducer,
  ],
  imports: [
    BullModule.registerQueue({ name: QUEUE }),
    JwtModule.register({}),
    CacheModule,
  ],
  exports: [AuthService],
})
export class AuthModule {}
