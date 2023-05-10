import { IsString, MaxLength } from 'class-validator';

export class AnswerInputModelDto {
  @IsString()
  @MaxLength(50)
  answer: string;
}
