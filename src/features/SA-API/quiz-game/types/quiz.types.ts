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

type AnswerStatuses = 'Correct' | 'InCorrect';

export type AnswersViewModel = {
  questionId: string;
  answerStatus: AnswerStatuses;
  addedAt: Date;
};

export type GamePlayerProgressViewModel = {
  answers: AnswersViewModel;
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
  questions: QuestionsViewModel;
  status: GameStatuses;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;
};
