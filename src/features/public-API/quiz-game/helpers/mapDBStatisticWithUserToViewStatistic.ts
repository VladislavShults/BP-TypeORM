import { Statistic } from '../../../SA-API/quiz-game/types/quiz.types';

export const mapDBStatisticWithUserToViewStatistic = (
  result,
): Statistic & { player: { id: string; login: string } } => ({
  gamesCount: Number(result.gamesCount),
  winsCount: Number(result.winsCount),
  lossesCount: Number(result.lossesCount),
  drawsCount: Number(result.drawsCount),
  sumScore: Number(result.sumScore),
  avgScores: Number(Number(result.avgScores).toFixed(2)),
  player: { id: String(result.id), login: result.login },
});
