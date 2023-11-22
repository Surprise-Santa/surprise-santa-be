import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('messaging.mail.host'),
          port: config.get<number>('messaging.mail.port'),
          auth: {
            user: config.get('messaging.mail.user'),
            pass: config.get('messaging.mail.password'),
          },
          pool: true,
        },
        defaults: {
          from: `"Claus From SecretSanta" < ${config.get(
            'messaging.mail.user',
          )}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MailingModule {}
