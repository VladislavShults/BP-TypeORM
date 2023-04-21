export type QuestionViewModel = {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PublishedStatuses = 'all' | 'published' | 'notPublished';
