import { StatusGame } from '../../../public-API/quiz-game/entities/quiz-game.entity';
import { AnswerStatus } from '../../../public-API/quiz-game/entities/quiz-game-answers.entity';

export type QuestionViewModel = {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PublishedStatuses = 'all' | 'published' | 'notPublished';

export type QuestionDbType = {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
};

export type QuestionsWithPagination = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: QuestionViewModel[];
};

export type PlayerViewModel = {
  id: string;
  login: string;
};

export type AnswersViewModel = {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: Date;
};

export type GamePlayerProgressViewModel = {
  answers: AnswersViewModel[] | null;
  player: PlayerViewModel;
  score: number;
};

export type QuestionsViewModel = {
  id: string;
  body: string;
};

export type GameStatuses = 'PendingSecondPlayer' | 'Active' | 'Finished';

export type GamePairViewModel = {
  id: string;
  firstPlayerProgress: GamePlayerProgressViewModel;
  secondPlayerProgress: GamePlayerProgressViewModel | null;
  questions: QuestionsViewModel[] | null;
  status: StatusGame;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;
};

export type GamePairsViewModelWithPagination = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: GamePairViewModel[];
};

export type Statistic = {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
};
