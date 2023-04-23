import { IsBoolean } from 'class-validator';

export class UpdatePublishQuestionDto {
  @IsBoolean()
  published: boolean;
}
