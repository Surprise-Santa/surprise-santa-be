import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import {
  IGroupInviteEmail,
  IResetPassword,
  IWelcomeEmail,
  Template,
} from './interfaces';

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

  async sendWelcomeEmail({
    email,
    subject = 'Welcome onboard to SecretSanta',
    template = Template.welcomeUserEmail,
    firstName,
  }: IWelcomeEmail) {
    await this.mailerService.sendMail({
      to: email,
      subject,
      template,
      context: { email, firstName },
    });
  }

  async sendGroupEmailInvite({
    email,
    subject = 'Group Invite',
    template = Template.sendGroupEmailInvite,
    firstName,
    name,
    link,
  }: IGroupInviteEmail) {
    await this.mailerService.sendMail({
      to: email,
      subject,
      template,
      context: { email, firstName, name, groupLink: link },
    });
  }

  async sendResetToken({
    email,
    subject = 'Password Reset Requested',
    template = Template.passwordResetEmail,
    firstName,
    link,
  }: IResetPassword) {
    await this.mailerService.sendMail({
      to: email,
      subject,
      template,
      context: { email, firstName, link },
    });
  }
}
