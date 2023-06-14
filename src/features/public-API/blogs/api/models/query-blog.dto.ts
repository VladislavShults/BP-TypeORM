import { BaseQueryDto } from '../../../../../shared/models/base-query-dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class QueryBlogDto extends BaseQueryDto {
  @IsString()
  searchNameTerm = '';

  @IsNotEmpty()
  @IsString()
  sortBy = 'createdAt';
}
