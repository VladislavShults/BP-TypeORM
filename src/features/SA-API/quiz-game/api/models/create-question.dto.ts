import { ArrayMaxSize, IsArray, IsString, Length } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @Length(10, 500)
  body: string;

  @IsArray()
  @ArrayMaxSize(10)
  correctAnswers: string[];
}
