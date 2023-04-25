import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { toNumber } from '../../../../public-API/blogs/helpers/cast.helper';

export class QueryQuestionsDto {
  @IsString()
  bodySearchTerm = '';

  @IsIn(['all', 'published', 'notPublished'])
  publishedStatus = 'all';

  @IsNotEmpty()
  @IsString()
  sortBy = 'createdAt';

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
