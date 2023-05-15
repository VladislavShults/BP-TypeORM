import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizGameRepository } from '../../../../SA-API/quiz-game/infrastructure/quizGame.repository';
import { AnswersViewModel } from '../../../../SA-API/quiz-game/types/quiz.types';
import { StatusGame } from '../../entities/quiz-game.entity';
import { Answer, AnswerStatus } from '../../entities/quiz-game-answers.entity';
import { randomUUID } from 'crypto';
import { filterResponsesFromAGivenUser } from '../../helpers/filterResponsesFromAGivenUser';
import { ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';

export class GiveAnAnswerCommand {
  constructor(public userId: string, public answer: string) {}
}

@CommandHandler(GiveAnAnswerCommand)
export class GiveAnAnswerUseCase
  implements ICommandHandler<GiveAnAnswerCommand>
{
  constructor(
    private quizGameRepository: QuizGameRepository,
    private dataSource: DataSource,
  ) {}
  async execute(command: GiveAnAnswerCommand): Promise<AnswersViewModel> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const activeGame = await this.quizGameRepository.findActivePair(
        command.userId,
        queryRunner.manager,
      );

      const answersActiveGame =
        await this.quizGameRepository.getAnswersActiveGame(
          activeGame.id,
          activeGame.firstPlayerId,
          activeGame.secondPlayerId,
        );

      const activePairWithAnswersAndQuestions =
        await this.quizGameRepository.findNotFinishedPair(command.userId);

      activeGame.answers = answersActiveGame;

      activeGame.questions = activePairWithAnswersAndQuestions.questions;

      const answersAboutUser = filterResponsesFromAGivenUser(
        activeGame,
        command.userId,
      );

      if (answersAboutUser.length >= 5) throw new ForbiddenException();

      const question = activeGame.questions[answersAboutUser.length];

      const answerIsCorrect = question.correctAnswers.find(
        (q) => q === command.answer,
      );

      if (!!answerIsCorrect && activeGame.firstPlayerId == command.userId) {
        activeGame.scoreFirstPlayer += 1;
      }

      if (!!answerIsCorrect && activeGame.secondPlayerId == command.userId) {
        activeGame.scoreSecondPlayer += 1;
      }

      const newAnswer = new Answer();
      newAnswer.id = randomUUID();
      newAnswer.questionId = question.id;
      newAnswer.answer = command.answer;
      newAnswer.userId = command.userId;
      newAnswer.addedAt = new Date();
      newAnswer.quizGameId = activeGame.id;
      newAnswer.answerStatus = !!answerIsCorrect
        ? AnswerStatus.Correct
        : AnswerStatus.Incorrect;

      activeGame.answers.push(newAnswer);

      const answer: AnswersViewModel = {
        questionId: newAnswer.questionId,
        answerStatus: newAnswer.answerStatus,
        addedAt: newAnswer.addedAt,
      };

      if (activeGame.answers.length === 10) {
        // Пользователь давший последний ответ
        const userIdPlayerGaveLastAnswer = activeGame.answers[9].userId;

        //Проверка наличия корректного ответа у пользователя первым ответившим на вопросы
        const correctAnswersFirstResponder = activeGame.answers.filter(
          (g) =>
            g.answerStatus === AnswerStatus.Correct &&
            g.userId != userIdPlayerGaveLastAnswer,
        );

        if (
          correctAnswersFirstResponder.length !== 0 &&
          activeGame.firstPlayerId != userIdPlayerGaveLastAnswer
        ) {
          activeGame.scoreFirstPlayer += 1;
        }

        if (
          correctAnswersFirstResponder.length !== 0 &&
          activeGame.firstPlayerId == userIdPlayerGaveLastAnswer
        ) {
          activeGame.scoreSecondPlayer += 1;
        }

        activeGame.finishGameDate = new Date();
        activeGame.status = StatusGame.Finished;
      }

      await this.quizGameRepository.saveInTransaction(
        activeGame,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();

      return answer;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof ForbiddenException) {
        throw new ForbiddenException();
      }
    } finally {
      await queryRunner.release();
    }
  }
}
