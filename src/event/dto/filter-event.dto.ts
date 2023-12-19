import { IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationSearchOptionsDto } from '../../common/database/pagination-search-options.dto';

export class FilterEventsDto extends PaginationSearchOptionsDto {
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;
}
