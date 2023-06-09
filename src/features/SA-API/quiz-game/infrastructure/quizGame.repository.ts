import { EntityManager, Repository } from 'typeorm';
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

  async findPairWithoutSecondPlayer(manager: EntityManager) {
    return manager
      .getRepository(QuizGame)
      .createQueryBuilder('game')
      .setLock('pessimistic_write')
      .where({ status: StatusGame.PendingSecondPlayer })
      .getOne();
  }

  async getFiveRandomQuestions() {
    return this.questionsRepo
      .createQueryBuilder('question')
      .where({ published: true })
      .orderBy('RANDOM()')
      .limit(5)
      .getMany();
  }

  async saveInTransaction(game: QuizGame, manager: EntityManager) {
    return manager.save(game);
  }

  async findActivePair(
    userId: string,
    manager: EntityManager,
  ): Promise<QuizGame> {
    return (
      manager
        .getRepository(QuizGame)
        .createQueryBuilder('game')
        // .leftJoinAndSelect('game.answers', 'answers')
        // .leftJoinAndSelect('game.questions', 'questions')
        .setLock('pessimistic_write')
        .where({ firstPlayerId: userId, status: StatusGame.Active })
        .orWhere({ secondPlayerId: userId, status: StatusGame.Active })
        .getOne()
    );
  }

  async getAnswersActiveGame(gameId: string, playerId: string) {
    return this.answersRepo.find({
      where: [{ quizGameId: gameId, userId: playerId }],
      order: { addedAt: 'ASC' },
    });
  }

  async getQuestionsByActiveGame(gameId: string): Promise<QuizGameQuestion[]> {
    const pairWithQuestions = await this.pairsRepo.find({
      where: { id: gameId },
      relations: { questions: true },
    });
    return pairWithQuestions[0].questions;
  }

  async finishedGameAboutTenSec() {
    const finishedDate = new Date(Date.now() - 10 * 1000);

    await this.pairsRepo
      .createQueryBuilder()
      .update(QuizGame)
      .set({
        status: StatusGame.Finished,
        finishGameDate: new Date(),
        winner: () =>
          `CASE WHEN "scoreFirstPlayer" > "scoreSecondPlayer" THEN CAST("firstPlayerId" AS TEXT)
           WHEN "scoreFirstPlayer" < "scoreSecondPlayer" THEN CAST("secondPlayerId" AS TEXT) 
           ELSE 'draw' END`,
      })
      .where('status = :status AND "lastResponseTimePlayers" < :finishDate', {
        status: StatusGame.Active,
        finishDate: finishedDate,
      })
      .execute();
  }
}
