import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsDate,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';

export class EditEventDto {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;
}
