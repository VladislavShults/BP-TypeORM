import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizGameQuestion } from '../entities/quiz-game-question.entity';
import { Repository } from 'typeorm';
import {
  GamePairViewModel,
  QuestionsWithPagination,
  QuestionViewModel,
} from '../types/quiz.types';
import { QueryQuestionsDto } from './models/query-questions.dto';
import { mapQuestionDbToViewType } from '../helpers/map-question-db-to-view';
import { QuizGame } from '../../../public-API/quiz-game/entities/quiz-game.entity';
import { mapDBPairToViewModel } from '../../../public-API/quiz-game/helpers/mapDBPairToViewModel';

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
}
