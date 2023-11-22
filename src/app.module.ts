import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { EventModule } from './event/event.module';
import { UserModule } from './user/user.module';
import { GroupModule } from './group/group.module';
import { MessagingModule } from './common/messaging/messaging.module';
import { PrismaModule } from './common/database/prisma/prisma.module';
import { PrismaService } from './common/database/prisma/prisma.service';
import { ThrottlerModule } from '@nestjs/throttler';
import appConfig from './app.config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/strategy/jwt.strategy';

@Module({
  imports: [
    AuthModule,
    GroupModule,
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    EventModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
        signOptions: {
          expiresIn: config.get('jwt.expiresIn'),
        },
      }),
    }),
    MessagingModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
  providers: [PrismaService, JwtService, JwtStrategy],
  exports: [AuthModule, JwtService],
})
export class AppModule {}
