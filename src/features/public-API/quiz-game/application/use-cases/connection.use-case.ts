import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizGameRepository } from '../../../../SA-API/quiz-game/infrastructure/quizGame.repository';
import { QuizGame, StatusGame } from '../../entities/quiz-game.entity';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';

export class ConnectionCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ConnectionCommand)
export class ConnectionUseCase implements ICommandHandler<ConnectionCommand> {
  constructor(
    private quizGameRepository: QuizGameRepository,
    private dataSource: DataSource,
  ) {}
  async execute(command: ConnectionCommand): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pairWithoutSecondPlayer =
        await this.quizGameRepository.findPairWithoutSecondPlayer(
          queryRunner.manager,
        );

      // await this.wait(10);

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
        const randomQuestions =
          await this.quizGameRepository.getFiveRandomQuestions();

        randomQuestions.sort((a, b) => +a.createdAt - +b.createdAt);

        pairWithoutSecondPlayer.secondPlayerId = command.userId;
        pairWithoutSecondPlayer.status = StatusGame.Active;
        pairWithoutSecondPlayer.startGameDate = new Date();
        pairWithoutSecondPlayer.questions = randomQuestions;

        await this.quizGameRepository.saveInTransaction(
          pairWithoutSecondPlayer,
          queryRunner.manager,
        );
        await queryRunner.commitTransaction();
        return pairWithoutSecondPlayer.id;
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  // private wait(sec) {
  //   return new Promise((resolve) => setTimeout(resolve, sec * 1000));
  // }
}
