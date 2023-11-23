import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RequestPasswordResetDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  newPassword: string;
}

export class ResetPasswordQuery {
  @IsString()
  @IsNotEmpty()
  token: string;
}
