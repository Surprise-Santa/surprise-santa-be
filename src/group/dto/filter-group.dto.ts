import { IsEnum, IsOptional } from 'class-validator';
import { Gender } from '../../common/interfaces';
import { PaginationSearchOptionsDto } from '../../common/database/pagination-search-options.dto';

export class FilterGroupDto extends PaginationSearchOptionsDto {
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}
