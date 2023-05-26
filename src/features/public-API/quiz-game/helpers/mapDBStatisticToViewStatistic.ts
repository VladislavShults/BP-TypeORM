import { Statistic } from '../../../SA-API/quiz-game/types/quiz.types';

export const mapDBStatisticToViewStatistic = (result): Statistic => ({
  sumScore: Number(result.sumScore),
  avgScores: Number(Number(result.avgScores).toFixed(2)),
  gamesCount: Number(result.gamesCount),
  winsCount: Number(result.winsCount),
  lossesCount: Number(result.lossesCount),
  drawsCount: Number(result.drawsCount),
});
