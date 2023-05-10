import { IsUUID } from 'class-validator';

export class GetAnswerInputModelDTO {
  @IsUUID()
  id: string;
}
