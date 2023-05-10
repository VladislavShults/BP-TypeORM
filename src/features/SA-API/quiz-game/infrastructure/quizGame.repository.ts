import { Repository } from 'typeorm';
import { QuizGameQuestion } from '../entities/quiz-game-question.entity';
import { Injectable } from '@nestjs/common';
import { QuestionDbType } from '../types/quiz.types';
import { UriParamQuestionDto } from '../api/models/uri-param-question-dto';
import { UpdateQuestionDto } from '../api/models/update-question.dto';
import { UpdatePublishQuestionDto } from '../api/models/update-publish-question.dto';
import {
  QuizGame,
  StatusGame,
} from '../../../public-API/quiz-game/entities/quiz-game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from '../../../public-API/quiz-game/entities/quiz-game-answers.entity';

@Injectable()
export class QuizGameRepository {
  constructor(
    @InjectRepository(QuizGameQuestion)
    private questionsRepo: Repository<QuizGameQuestion>,
    @InjectRepository(QuizGame)
    private pairsRepo: Repository<QuizGame>,
    @InjectRepository(Answer)
    private answersRepo: Repository<Answer>,
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

  async save(newPair: QuizGame): Promise<string> {
    const pair = await this.pairsRepo.save(newPair);
    return pair.id;
  }

  async findPairWithoutSecondPlayer() {
    const pair = await this.pairsRepo.findOne({
      where: { secondPlayerId: null, status: StatusGame.PendingSecondPlayer },
    });

    if (!pair) return null;

    return pair;
  }

  async getFiveRandomQuestions() {
    return this.questionsRepo
      .createQueryBuilder()
      .where('published = true')
      .orderBy('RANDOM()')
      .limit(5)
      .getMany();
  }

  async saveAnswer(newAnswer: Answer): Promise<Answer> {
    return this.answersRepo.save(newAnswer);
  }
}
