import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class GroupLogoDto {
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  logo?: Express.Multer.File;
}
