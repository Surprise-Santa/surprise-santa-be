import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class AddEventParticipantsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @IsUUID(undefined, { each: true })
  @ValidateIf((obj, val) => !!val || !obj.all)
  participants: string[];

  @IsBoolean()
  all: boolean;
}
