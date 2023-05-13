import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizGameQuestion } from '../entities/quiz-game-question.entity';
import { Not, Repository } from 'typeorm';
import {
  GamePairsViewModelWithPagination,
  GamePairViewModel,
  QuestionsWithPagination,
  QuestionViewModel,
} from '../types/quiz.types';
import { QueryQuestionsDto } from './models/query-questions.dto';
import { mapQuestionDbToViewType } from '../helpers/map-question-db-to-view';
import {
  QuizGame,
  StatusGame,
} from '../../../public-API/quiz-game/entities/quiz-game.entity';
import { mapDBPairToViewModel } from '../../../public-API/quiz-game/helpers/mapDBPairToViewModel';
import { QueryGameDTO } from '../../../public-API/quiz-game/api/models/query-game.DTO';

@Injectable()
export class QuizQueryRepository {
  constructor(
    @InjectRepository(QuizGameQuestion)
    private questionsRepo: Repository<QuizGameQuestion>,
    @InjectRepository(QuizGame)
    private pairsRepo: Repository<QuizGame>,
  ) {}

  async getQuestionById(id: string): Promise<QuestionViewModel> {
    const result = await this.questionsRepo.findOneBy({ id, isDeleted: false });

    return mapQuestionDbToViewType(result);
  }

  async getAllQuestions(
    query: QueryQuestionsDto,
  ): Promise<QuestionsWithPagination> {
    const {
      bodySearchTerm,
      publishedStatus,
      sortBy,
      sortDirection,
      pageSize,
      pageNumber,
    } = query;

    let publishedSearchTerm: boolean;

    if (publishedStatus === 'published') publishedSearchTerm = true;
    if (publishedStatus === 'notPublished') publishedSearchTerm = false;

    let params: { bodySearch: string; publishedSearchTerm?: boolean };

    let stringWhere: string;

    if (publishedStatus === 'all') {
      stringWhere = '"isDeleted" = false AND LOWER(q."body") like :bodySearch';
      params = { bodySearch: '%' + bodySearchTerm.toLocaleLowerCase() + '%' };
    }

    if (publishedStatus !== 'all') {
      stringWhere =
        '"isDeleted" = false AND LOWER(q."body") like :bodySearch AND q."published" = :publishedSearchTerm';
      params = {
        bodySearch: '%' + bodySearchTerm.toLocaleLowerCase() + '%',
        publishedSearchTerm,
      };
    }

    const itemsDB = await this.questionsRepo
      .createQueryBuilder('q')
      .where(stringWhere, params)
      .limit(pageSize)
      .orderBy('"' + sortBy + '"', sortDirection)
      .offset((pageNumber - 1) * pageSize)
      .getManyAndCount();

    const items = itemsDB[0].map((i) => mapQuestionDbToViewType(i));

    const totalCount = Number(itemsDB[1]);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount),
      items,
    };
  }

  async getPairById(pairId: string): Promise<GamePairViewModel> {
    const pair = await this.pairsRepo.findOne({
      where: { id: pairId },
      relations: {
        firstPlayer: true,
        secondPlayer: true,
        answers: true,
        questions: true,
      },
    });
    return mapDBPairToViewModel(pair);
  }

  async findNotFinishedPair(userId: string): Promise<QuizGame> {
    return this.pairsRepo.findOne({
      where: [
        { firstPlayerId: userId, status: Not(StatusGame.Finished) },
        { secondPlayerId: userId, status: Not(StatusGame.Finished) },
      ],
      relations: { answers: true, questions: true },
    });
  }

  async findAllStatusGameById(id: string): Promise<QuizGame> {
    return this.pairsRepo.findOneBy({ id });
  }

  async findActivePairByUserId(userId: string): Promise<QuizGame> {
    return this.pairsRepo.findOne({
      where: [
        { firstPlayerId: userId, status: StatusGame.Active },
        { secondPlayerId: userId, status: StatusGame.Active },
      ],
    });
  }

  async getAllPairsByUserId(
    userId: string,
    query: QueryGameDTO,
  ): Promise<GamePairsViewModelWithPagination> {
    const { sortBy, sortDirection, pageSize, pageNumber } = query;

    const pairs = await this.pairsRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.answers', 'answers')
      .leftJoinAndSelect('p.questions', 'quiz_game_question')
      .leftJoinAndSelect('p.firstPlayer', 'user')
      .leftJoinAndSelect('p.secondPlayer', 'user1')
      .where('p."firstPlayerId" = :userId OR p."secondPlayerId" = :userId', {
        userId,
      })
      .orderBy('"' + sortBy + '"', sortDirection)
      .addOrderBy('p."pairCreatedDate"', 'DESC')
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize)
      .getManyAndCount();

    const items = pairs[0].map((p) => mapDBPairToViewModel(p));

    const totalCount = Number(pairs[1]);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount),
      items,
    };
  }
}
