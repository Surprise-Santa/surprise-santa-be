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

  async sendWelcomeEmail(email: string, firstName: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome onboard to SecretSanta',
      template: 'welcomeUserEmail',
      context: { email, firstName },
    });
  }

  async sendGroupEmailInvite(
    email: string,
    firstName: string,
    name: string,
    groupLink: string,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Group Invite',
      template: 'sendGroupEmailInvite',
      context: { email, firstName, name, groupLink },
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
