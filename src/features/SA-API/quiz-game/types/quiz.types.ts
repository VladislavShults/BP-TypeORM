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
