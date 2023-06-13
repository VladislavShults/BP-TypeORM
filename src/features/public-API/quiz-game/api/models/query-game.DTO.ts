import { IsNotEmpty, IsString } from 'class-validator';
import { BaseQueryDto } from '../../../../../shared/models/base-query-dto';

export class QueryGameDTO extends BaseQueryDto {
  @IsNotEmpty()
  @IsString()
  sort = 'pairCreatedDate';
}
