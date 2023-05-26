import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { toArray, toNumber } from '../../../blogs/helpers/cast.helper';

export class QueryStatisticDTO {
  @Transform(({ value }) =>
    toArray(value, { default: ['avgScores desc', 'sumScore desc'] }),
  )
  @IsArray()
  public sort = ['avgScores desc', 'sumScore desc'];

  @Transform(({ value }) => toNumber(value, { default: 1, min: 1 }))
  @IsNumber()
  @IsOptional()
  public pageNumber = 1;

  @Transform(({ value }) => toNumber(value, { default: 10, min: 1 }))
  @IsNumber()
  @IsOptional()
  public pageSize = 10;
}
