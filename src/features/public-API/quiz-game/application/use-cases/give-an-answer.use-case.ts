import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizGameRepository } from '../../../../SA-API/quiz-game/infrastructure/quizGame.repository';
import { AnswersViewModel } from '../../../../SA-API/quiz-game/types/quiz.types';
import { QuizGame } from '../../entities/quiz-game.entity';
import { Answer, AnswerStatus } from '../../entities/quiz-game-answers.entity';
import { randomUUID } from 'crypto';

export class GiveAnAnswerCommand {
  constructor(
    public activeGame: QuizGame,
    public userId: string,
    public answer: string,
    public answersAboutUser: Answer[],
  ) {}
}

@CommandHandler(GiveAnAnswerCommand)
export class GiveAnAnswerUseCase
  implements ICommandHandler<GiveAnAnswerCommand>
{
  constructor(private quizGameRepository: QuizGameRepository) {}
  async execute(command: GiveAnAnswerCommand): Promise<AnswersViewModel> {
    const question =
      command.activeGame.questions[command.answersAboutUser.length];

    const answerIsCorrect = question.correctAnswers.find(
      (q) => q === command.answer,
    );

    if (
      !!answerIsCorrect &&
      command.activeGame.firstPlayerId == command.userId
    ) {
      command.activeGame.scoreFirstPlayer += 1;
    }

    if (
      !!answerIsCorrect &&
      command.activeGame.secondPlayerId == command.userId
    ) {
      command.activeGame.scoreSecondPlayer += 1;
    }

    const newAnswer = new Answer();
    newAnswer.id = randomUUID();
    newAnswer.questionId = question.id;
    newAnswer.answer = command.answer;
    newAnswer.userId = command.userId;
    newAnswer.addedAt = new Date();
    newAnswer.quizGameId = command.activeGame.id;
    newAnswer.answerStatus = !!answerIsCorrect
      ? AnswerStatus.Correct
      : AnswerStatus.Incorrect;

    command.activeGame.answers.push(newAnswer);

    const answer: AnswersViewModel = {
      questionId: newAnswer.questionId,
      answerStatus: newAnswer.answerStatus,
      addedAt: newAnswer.addedAt,
    };

    if (command.activeGame.answers.length === 10) {
      // Пользователь давший последний ответ
      const userIdPlayerGaveLastAnswer = command.activeGame.answers[9].userId;

      //Проверка наличия корректного ответа у пользователя первым ответившим на вопросы
      const correctAnswersFirstResponder = command.activeGame.answers.filter(
        (g) =>
          g.answerStatus === AnswerStatus.Correct &&
          g.userId != userIdPlayerGaveLastAnswer,
      );

      if (
        correctAnswersFirstResponder.length !== 0 &&
        command.activeGame.firstPlayerId != userIdPlayerGaveLastAnswer
      ) {
        command.activeGame.scoreFirstPlayer += 1;
      }

      if (
        correctAnswersFirstResponder.length !== 0 &&
        command.activeGame.firstPlayerId == userIdPlayerGaveLastAnswer
      ) {
        command.activeGame.scoreSecondPlayer += 1;
      }
    }

    await this.quizGameRepository.save(command.activeGame);

    return answer;
  }
}
