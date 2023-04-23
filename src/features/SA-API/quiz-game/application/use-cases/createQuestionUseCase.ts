import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionDbType } from '../../types/quiz.types';
import { QuizGameRepository } from '../../infrastructure/quizGame.repository';
import { CreateQuestionDto } from '../../api/models/create-question.dto';

export class CreateQuestionCommand {
  constructor(public readonly createQuestionDto: CreateQuestionDto) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase
  implements ICommandHandler<CreateQuestionCommand>
{
  constructor(private quizGameRepository: QuizGameRepository) {}

  async execute(command: CreateQuestionCommand): Promise<string> {
    const newQuestion: Omit<QuestionDbType, 'id'> = {
      body: command.createQuestionDto.body,
      correctAnswers: command.createQuestionDto.correctAnswers,
      published: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    };
    return this.quizGameRepository.createQuestion(newQuestion);
  }
}
