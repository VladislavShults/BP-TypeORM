import { Statistic } from '../../../SA-API/quiz-game/types/quiz.types';

export const mapDBStatisticToViewStatistic = (result): Statistic => ({
  sumScore: Number(result.sumScore),
  avgScores:
    Number(result.gamesCount) !== 0
      ? Number((Number(result.sumScore) / Number(result.gamesCount)).toFixed(2))
      : 0,
  gamesCount: Number(result.gamesCount),
  winsCount: Number(result.winsCount),
  lossesCount: Number(result.lossesCount),
  drawsCount: Number(result.drawsCount),
});
