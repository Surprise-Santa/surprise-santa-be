import {
  ArrayMinSize,
  IsBoolean,
  IsOptional,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class AddEventParticipantsDto {
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  @ValidateIf((obj, val) => !!val || !obj.all)
  participants: string[];

  @IsBoolean()
  @IsOptional()
  all?: boolean;
}
