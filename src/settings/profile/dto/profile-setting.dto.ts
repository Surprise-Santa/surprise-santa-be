import { Gender } from '@@/common/interfaces';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMobilePhone, IsOptional, IsString } from 'class-validator';

export class ProfileSettingDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsMobilePhone(undefined, { strictMode: true })
  phone?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}

export class ProfilePicDto {
  @ApiPropertyOptional({
    type: String,
    format: 'binary',
    example: 'picture',
  })
  @IsOptional()
  profilePic?: Express.Multer.File;
}
