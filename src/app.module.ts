import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { EventModule } from './event/event.module';
import { UserModule } from './user/user.module';
import { CompanyModule } from './company/company.module';
import { MessagingModule } from './common/messaging/messaging.module';
import { PrismaModule } from './common/database/prisma/prisma.module';
import { PrismaService } from './common/database/prisma/prisma.service';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    AuthModule,
    CompanyModule,
    ConfigModule.forRoot({ isGlobal: true }),
    EventModule,
    MessagingModule,
    PrismaModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 10,
        },
      ],
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
