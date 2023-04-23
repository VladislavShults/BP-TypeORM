import { QuestionDbType, QuestionViewModel } from '../types/quiz.types';

export const mapQuestionDbToViewType = (
  questionDbType: QuestionDbType,
): QuestionViewModel => ({
  id: questionDbType.id.toString(),
  body: questionDbType.body,
  correctAnswers: questionDbType.correctAnswers,
  published: questionDbType.published,
  createdAt: questionDbType.createdAt,
  updatedAt: questionDbType.createdAt,
});
