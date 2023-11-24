import { Gender } from '@@/common/interfaces';
import {
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class ClientGoogleLoginDto {
  @IsNotEmpty()
  @IsString()
  accessToken: string;
}

export class ClientGoogleRegisterDto extends ClientGoogleLoginDto {
  @IsNotEmpty()
  @IsString()
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsMobilePhone(undefined, { strictMode: true })
  @IsOptional()
  phone?: string;
}
