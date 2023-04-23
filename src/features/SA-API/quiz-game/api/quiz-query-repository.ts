import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizGameQuestion } from '../entities/quiz-game-question.entity';
import { Repository } from 'typeorm';
import { QuestionViewModel } from '../types/quiz.types';

@Injectable()
export class QuizQueryRepository {
  constructor(
    @InjectRepository(QuizGameQuestion)
    private questionsRepo: Repository<QuizGameQuestion>,
  ) {}

  async getQuestionById(id: string): Promise<QuestionViewModel> {
    const result = await this.questionsRepo.findOneBy({ id, isDeleted: false });
    return {
      id: id.toString(),
      body: result.body,
      correctAnswers: result.correctAnswers,
      published: result.published,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }
}
