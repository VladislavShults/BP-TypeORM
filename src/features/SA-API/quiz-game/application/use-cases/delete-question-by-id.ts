import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizGameRepository } from '../../infrastructure/quizGame.repository';
import { UriParamQuestionDto } from '../../api/models/uri-param-question-dto';

export class DeleteQuestionByIdCommand {
  constructor(public readonly paramQuestionDto: UriParamQuestionDto) {}
}

@CommandHandler(DeleteQuestionByIdCommand)
export class DeleteQuestionByIdUseCase
  implements ICommandHandler<DeleteQuestionByIdCommand>
{
  constructor(private quizGameRepository: QuizGameRepository) {}

  async execute(command: DeleteQuestionByIdCommand): Promise<void> {
    await this.quizGameRepository.deleteQuestionById(
      command.paramQuestionDto.id,
    );
  }
}
