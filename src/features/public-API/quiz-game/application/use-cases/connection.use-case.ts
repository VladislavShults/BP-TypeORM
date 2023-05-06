import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizGameRepository } from '../../../../SA-API/quiz-game/infrastructure/quizGame.repository';

export class ConnectionCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ConnectionCommand)
export class ConnectionUseCase implements ICommandHandler<ConnectionCommand> {
  constructor(private quizGameRepository: QuizGameRepository) {}
  async execute(command: ConnectionCommand): Promise<string> {}
}
