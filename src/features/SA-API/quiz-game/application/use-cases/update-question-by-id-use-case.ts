import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizGameRepository } from '../../infrastructure/quizGame.repository';
import { UpdateQuestionDto } from '../../api/models/update-question.dto';
import { UriParamQuestionDto } from '../../api/models/uri-param-question-dto';

export class UpdateQuestionByIdCommand {
  constructor(
    public readonly updateQuestionDto: UpdateQuestionDto,
    public readonly uriParamQuestionDto: UriParamQuestionDto,
  ) {}
}

@CommandHandler(UpdateQuestionByIdCommand)
export class UpdateQuestionByIdUseCase
  implements ICommandHandler<UpdateQuestionByIdCommand>
{
  constructor(private quizGameRepository: QuizGameRepository) {}

  async execute(command: UpdateQuestionByIdCommand): Promise<void> {
    await this.quizGameRepository.updateQuestionById(
      command.updateQuestionDto,
      command.uriParamQuestionDto,
    );
  }
}
