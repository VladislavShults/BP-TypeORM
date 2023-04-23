import { UriParamQuestionDto } from '../../api/models/uri-param-question-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizGameRepository } from '../../infrastructure/quizGame.repository';
import { UpdatePublishQuestionDto } from '../../api/models/update-publish-question.dto';

export class UpdatePublishedQuestionByIdCommand {
  constructor(
    public readonly updateQuestionDto: UpdatePublishQuestionDto,
    public readonly uriParamQuestionDto: UriParamQuestionDto,
  ) {}
}

@CommandHandler(UpdatePublishedQuestionByIdCommand)
export class UpdatePublishedQuestionByIdUseCase
  implements ICommandHandler<UpdatePublishedQuestionByIdCommand>
{
  constructor(private quizGameRepository: QuizGameRepository) {}

  async execute(command: UpdatePublishedQuestionByIdCommand): Promise<void> {
    await this.quizGameRepository.updatePublishedQuestionById(
      command.updateQuestionDto,
      command.uriParamQuestionDto,
    );
  }
}
