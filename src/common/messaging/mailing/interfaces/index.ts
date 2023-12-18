export enum Template {
  passwordResetEmail = 'passwordResetEmail',
  sendGroupEmailInvite = 'sendGroupEmailInvite',
  welcomeUserEmail = 'welcomeUserEmail',
}

export interface ISendEmail {
  email: string;
  firstName: string;
  template?: Template;
  subject?: string;
}

export interface IResetPassword extends ISendEmail {
  link: string;
}

export interface IWelcomeEmail extends ISendEmail {}

export interface IGroupInviteEmail extends ISendEmail {
  groupName: string;
  groupCode: string;
}
