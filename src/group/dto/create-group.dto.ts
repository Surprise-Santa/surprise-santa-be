import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ApiHideProperty()
  groupCode: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  logoUrl?: Express.Multer.File;
}
