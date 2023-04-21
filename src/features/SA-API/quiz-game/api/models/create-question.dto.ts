import { IsArray, IsString, Length, MaxLength } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @Length(10, 500)
  body: string;

  @IsArray()
  @MaxLength(10)
  correctAnswers: string[];
}
