import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizGameQuestion } from '../entities/quiz-game-question.entity';
import { Injectable } from '@nestjs/common';
import { QuestionDbType } from '../types/quiz.types';
import { UriParamQuestionDto } from '../api/models/uri-param-question-dto';
import { UpdateQuestionDto } from '../api/models/update-question.dto';
import { UpdatePublishQuestionDto } from '../api/models/update-publish-question.dto';

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

  async updateQuestionById(
    updateQuestionDto: UpdateQuestionDto,
    uriParamQuestionDto: UriParamQuestionDto,
  ) {
    const newDate = new Date();

    await this.questionsRepo
      .createQueryBuilder()
      .update(QuizGameQuestion)
      .set({
        body: updateQuestionDto.body,
        correctAnswers: updateQuestionDto.correctAnswers,
        updatedAt: newDate,
      })
      .where('id = :id', { id: uriParamQuestionDto.id })
      .execute();
  }

  async updatePublishedQuestionById(
    updateQuestionDto: UpdatePublishQuestionDto,
    uriParamQuestionDto: UriParamQuestionDto,
  ) {
    const newDate = new Date();

    await this.questionsRepo
      .createQueryBuilder()
      .update(QuizGameQuestion)
      .set({
        published: updateQuestionDto.published,
        updatedAt: newDate,
      })
      .where('id = :id', { id: uriParamQuestionDto.id })
      .execute();
  }
}
