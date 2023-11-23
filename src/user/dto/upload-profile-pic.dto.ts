import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UploadProfilePicDto {
  @ApiPropertyOptional({
    type: String,
    format: 'binary',
    example: 'picture',
  })
  @IsOptional()
  picture?: Express.Multer.File;
}
