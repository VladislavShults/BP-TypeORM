import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

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

  @IsNumber()
  pageNumber = 1;

  @IsNumber()
  pageSize = 10;
}
