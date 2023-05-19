import { Statistic } from '../../../SA-API/quiz-game/types/quiz.types';

export const mapDBStatisticWithUserToViewStatistic = (
  result,
): Statistic & { player: { id: string; login: string } } => ({
  sumScore: Number(result.sumScore),
  avgScores:
    Number(result.gamesCount) !== 0
      ? Number((Number(result.sumScore) / Number(result.gamesCount)).toFixed(2))
      : 0,
  gamesCount: Number(result.gamesCount),
  winsCount: Number(result.winsCount),
  lossesCount: Number(result.lossesCount),
  drawsCount: Number(result.drawsCount),
  player: { id: result.id, login: result.login },
});
