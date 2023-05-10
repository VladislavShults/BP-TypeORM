import { QuizGame } from '../entities/quiz-game.entity';
import { Answer } from '../entities/quiz-game-answers.entity';

export const filterResponsesFromAGivenUser = (
  game: QuizGame,
  userId: string,
): Answer[] => {
  const answers = game.answers;

  return answers.filter((a) => a.userId === userId);
};
