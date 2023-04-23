import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizGameQuestion } from '../entities/quiz-game-question.entity';
import { Injectable } from '@nestjs/common';
import { QuestionDbType } from '../types/quiz.types';

@Injectable()
export class QuizGameRepository {
  constructor(
    @InjectRepository(QuizGameQuestion)
    private questionsRepo: Repository<QuizGameQuestion>,
  ) {}

  async createQuestion(
    newQuestion: Omit<QuestionDbType, 'id'>,
  ): Promise<string> {
    const result = await this.questionsRepo.save(newQuestion);
    return result.id;
  }

  async deleteQuestionById(id: string) {
    await this.questionsRepo
      .createQueryBuilder()
      .update(QuizGameQuestion)
      .set({ isDeleted: true })
      .where('id = :id', { id })
      .execute();
  }
}
