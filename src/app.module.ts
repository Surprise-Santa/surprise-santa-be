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
import { CacheModule } from './common/cache/cache.module';
import { TokenService } from './common/token/token.service';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { GoogleStrategy } from './auth/strategy/google.strategy';
import { WishlistModule } from './wishlist/wishlist.module';
import { SettingsModule } from './settings/settings.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    AuthModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        prefix: `${config.get('environment')}:${config.get('app.name')}`,
        redis: {
          host: config.get('redis.host'),
          port: config.get('redis.port'),
        },
      }),
    }),
    GroupModule,
    CacheModule,
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
    CloudinaryModule,
    WishlistModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [
    PrismaService,
    GoogleStrategy,
    JwtService,
    JwtStrategy,
    TokenService,
  ],
  exports: [AuthModule, JwtService, TokenService],
})
export class AppModule {}
