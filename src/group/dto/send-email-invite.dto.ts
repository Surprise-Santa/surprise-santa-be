import { ArrayMinSize, IsEmail } from 'class-validator';

export class SendEmailInviteDto {
  @ArrayMinSize(1)
  @IsEmail(undefined, { each: true })
  emails: string[];
}
