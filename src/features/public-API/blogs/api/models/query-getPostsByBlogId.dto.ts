import { BaseQueryDto } from '../../../../../shared/models/base-query-dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class QueryGetPostsByBlogIdDto extends BaseQueryDto {
  @IsNotEmpty()
  @IsString()
  sortBy = 'createdAt';
}
