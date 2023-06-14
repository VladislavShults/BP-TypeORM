import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { toNumber } from '../../features/public-API/blogs/helpers/cast.helper';

export abstract class BaseQueryDto {
  @IsIn(['ASC', 'DESC'])
  @Transform((sortDir) => sortDir.value.toUpperCase())
  sortDirection: 'ASC' | 'DESC' = 'DESC';

  @Transform(({ value }) => toNumber(value, { default: 1, min: 1 }))
  @IsNumber()
  @IsOptional()
  public pageNumber = 1;

  @Transform(({ value }) => toNumber(value, { default: 10, min: 1 }))
  @IsNumber()
  @IsOptional()
  public pageSize = 10;
}
