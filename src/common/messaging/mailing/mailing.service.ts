import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { IResetPassword } from './interfaces';

@Injectable()
export class MailingService {
  constructor(private mailerService: MailerService) {}

  async sendTestEmail(email: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'This is just a test email from SecretSanta',
      template: 'testEmail',
      context: { email },
    });

    return { message: 'Test email successfully sent' };
  }

  async sendWelcomeEmail(email: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome onboard to SecretSanta',
      template: 'welcomeUserEmail',
      context: { email },
    });
  }

  async sendResetToken({ email, firstName, link }: IResetPassword) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Requested',
      template: 'passwordResetEmail',
      context: { email, firstName, link },
    });
  }
}
