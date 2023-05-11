import { QuizGame } from '../entities/quiz-game.entity';
import {
  AnswersViewModel,
  GamePairViewModel,
} from '../../../SA-API/quiz-game/types/quiz.types';
import { Answer } from '../entities/quiz-game-answers.entity';

export const mapDBPairToViewModel = (pair: QuizGame): GamePairViewModel => {
  const answersFirstPlayer = pair.answers.filter(
    (p) => p.userId == pair.firstPlayerId,
  );

  const answersSecondPlayer = pair.answers.filter(
    (p) => p.userId == pair.secondPlayerId,
  );

  let arrQuestions;

  if (pair.questions.length !== 0)
    arrQuestions = pair.questions.map((p) => ({
      id: p.id,
      body: p.body,
    }));

  return {
    id: pair.id,
    firstPlayerProgress: {
      answers:
        answersFirstPlayer.length === 0
          ? []
          : answersFirstPlayer.map((a) => mapAnswer(a)),
      player: {
        id: pair.firstPlayer.id.toString(),
        login: pair.firstPlayer.login,
      },
      score: pair.scoreFirstPlayer,
    },
    secondPlayerProgress: !pair.secondPlayer
      ? null
      : {
          answers:
            answersSecondPlayer.length === 0
              ? []
              : answersSecondPlayer.map((a) => mapAnswer(a)),
          player: {
            id: pair.secondPlayer.id.toString(),
            login: pair.secondPlayer.login,
          },
          score: pair.scoreSecondPlayer,
        },
    questions: pair.questions.length === 0 ? null : arrQuestions,
    status: pair.status,
    pairCreatedDate: pair.pairCreatedDate,
    startGameDate: pair.startGameDate,
    finishGameDate: pair.finishGameDate,
  };
};

const mapAnswer = (answer: Answer): AnswersViewModel => ({
  questionId: answer.questionId,
  answerStatus: answer.answerStatus,
  addedAt: answer.addedAt,
});
