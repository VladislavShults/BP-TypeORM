import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizGameRepository } from '../../../../SA-API/quiz-game/infrastructure/quizGame.repository';
import { QuizGame, StatusGame } from '../../entities/quiz-game.entity';
import { randomUUID } from 'crypto';

export class ConnectionCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ConnectionCommand)
export class ConnectionUseCase implements ICommandHandler<ConnectionCommand> {
  constructor(private quizGameRepository: QuizGameRepository) {}
  async execute(command: ConnectionCommand): Promise<string> {
    const pairWithoutSecondPlayer =
      await this.quizGameRepository.findPairWithoutSecondPlayer();

    if (!pairWithoutSecondPlayer) {
      const newPair = new QuizGame();
      newPair.id = randomUUID();
      newPair.firstPlayerId = command.userId;
      newPair.secondPlayerId = null;
      newPair.status = StatusGame.PendingSecondPlayer;
      newPair.pairCreatedDate = new Date();
      newPair.startGameDate = null;
      newPair.finishGameDate = null;
      newPair.answers = null;
      newPair.questions = null;
      newPair.scoreFirstPlayer = 0;
      newPair.scoreSecondPlayer = 0;

      return this.quizGameRepository.save(newPair);
    } else {
      pairWithoutSecondPlayer.secondPlayerId = command.userId;
      pairWithoutSecondPlayer.status = StatusGame.Active;
      pairWithoutSecondPlayer.startGameDate = new Date();
      pairWithoutSecondPlayer.questions =
        await this.quizGameRepository.getFiveRandomQuestions();

      return this.quizGameRepository.save(pairWithoutSecondPlayer);
    }
  }
}
