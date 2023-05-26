import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizGameQuestion } from '../entities/quiz-game-question.entity';
import { Not, Repository } from 'typeorm';
import {
  GamePairsViewModelWithPagination,
  GamePairViewModel,
  QuestionsWithPagination,
  QuestionViewModel,
  Statistic,
  StatisticWithPagination,
} from '../types/quiz.types';
import { QueryQuestionsDto } from './models/query-questions.dto';
import { mapQuestionDbToViewType } from '../helpers/map-question-db-to-view';
import {
  QuizGame,
  StatusGame,
} from '../../../public-API/quiz-game/entities/quiz-game.entity';
import { mapDBPairToViewModel } from '../../../public-API/quiz-game/helpers/mapDBPairToViewModel';
import { QueryGameDTO } from '../../../public-API/quiz-game/api/models/query-game.DTO';
import { mapDBStatisticToViewStatistic } from '../../../public-API/quiz-game/helpers/mapDBStatisticToViewStatistic';
import { User } from '../../users/entities/user.entity';
import { mapDBStatisticWithUserToViewStatistic } from '../../../public-API/quiz-game/helpers/mapDBStatisticWithUserToViewStatistic';
import { QueryStatisticDTO } from '../../../public-API/quiz-game/api/models/query-statistic.DTO';

@Injectable()
export class QuizQueryRepository {
  constructor(
    @InjectRepository(QuizGameQuestion)
    private questionsRepo: Repository<QuizGameQuestion>,
    @InjectRepository(QuizGame)
    private pairsRepo: Repository<QuizGame>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
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
    const pair = await this.pairsRepo
      .createQueryBuilder('p')
      .where({ id: pairId })
      .leftJoinAndSelect('p.answers', 'answers')
      .leftJoinAndSelect('p.questions', 'questions')
      .leftJoinAndSelect('p.firstPlayer', 'user')
      .leftJoinAndSelect('p.secondPlayer', 'user1')
      .orderBy('answers.addedAt', 'ASC')
      .addOrderBy('questions.createdAt', 'ASC')
      .getOne();

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
    const { sort, sortDirection, pageSize, pageNumber } = query;

    const pairs = await this.pairsRepo
      .createQueryBuilder('p')
      .where({ firstPlayerId: userId })
      .orWhere({ secondPlayerId: userId })
      .orderBy('"' + sort + '"', sortDirection)
      .skip((pageNumber - 1) * pageSize)
      // .limit(pageSize)
      .addOrderBy('p."pairCreatedDate"', 'DESC')
      .leftJoinAndSelect('p.answers', 'answers')
      .leftJoinAndSelect('p.questions', 'questions')
      .leftJoinAndSelect('p.firstPlayer', 'user')
      .leftJoinAndSelect('p.secondPlayer', 'user1')
      .addOrderBy('answers.addedAt', 'ASC')
      .addOrderBy('questions.createdAt', 'ASC')
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

  async getStatistic(userId: string): Promise<Statistic> {
    const result = await this.pairsRepo
      .createQueryBuilder('game')
      .select(
        'SUM(CASE WHEN game."firstPlayerId" = :userId THEN game."scoreFirstPlayer" ELSE game."scoreSecondPlayer" END)',
        'sumScore',
      )
      .addSelect(
        'ROUND(AVG(CASE WHEN game.firstPlayerId = :userId THEN game.scoreFirstPlayer ELSE game.scoreSecondPlayer END), 2)',
        'avgScores',
      )
      .addSelect('COUNT(game.id)', 'gamesCount')
      .addSelect(
        `SUM(CASE WHEN game."winner" = :userId THEN 1
                     ELSE 0 END)`,
        'winsCount',
      )
      .addSelect(
        `SUM(CASE WHEN game."firstPlayerId" = :userId AND game.winner = CAST(game."secondPlayerId" AS TEXT) THEN 1
                     WHEN game."secondPlayerId" = :userId AND game.winner = CAST(game."firstPlayerId" AS TEXT) THEN 1
                     ELSE 0 END)`,
        'lossesCount',
      )
      .addSelect(
        `SUM(CASE WHEN game."firstPlayerId" = :userId AND game."winner" = :draw THEN 1
        WHEN game."secondPlayerId" = :userId AND game."winner" = :draw THEN 1
        ELSE 0 END)`,
        'drawsCount',
      )
      .where('"firstPlayerId" = :userId OR "secondPlayerId" = :userId', {
        userId,
        draw: 'draw',
      })
      .getRawOne();

    return mapDBStatisticToViewStatistic(result);
  }

  async getStatisticAllUsers(
    query: QueryStatisticDTO,
  ): Promise<StatisticWithPagination> {
    let { sort } = query;

    const { pageSize, pageNumber } = query;

    if (typeof sort === 'string') sort = [sort];

    const sortFields: string[] = [];
    const sortOrders: string[] = [];

    // Разбиваем строку запроса на отдельные части
    sort.forEach((part) => {
      const [field, order] = part.split(' ');
      sortFields.push(field);
      sortOrders.push(order.toLocaleUpperCase());
    });

    const queryTypeOrm = this.pairsRepo
      .createQueryBuilder('game')
      .select(
        'SUM(CASE WHEN game."firstPlayerId" = user.id THEN game."scoreFirstPlayer" ELSE game."scoreSecondPlayer" END)',
        'sumScore',
      )
      .addSelect(
        'ROUND(AVG(CASE WHEN game.firstPlayerId = user.id THEN game.scoreFirstPlayer ELSE game.scoreSecondPlayer END), 2)',
        'avgScores',
      )
      .addSelect('COUNT(game.id)', 'gamesCount')
      .addSelect(
        `SUM(CASE WHEN game."firstPlayerId" = user.id AND game."scoreFirstPlayer" > game."scoreSecondPlayer" THEN 1
                     WHEN game."secondPlayerId" = user.id AND game."scoreSecondPlayer" > game."scoreFirstPlayer" THEN 1
                     ELSE 0 END)`,
        'winsCount',
      )
      .addSelect(
        `SUM(CASE WHEN game."firstPlayerId" = user.id AND game."scoreFirstPlayer" < game."scoreSecondPlayer" THEN 1
                     WHEN game."secondPlayerId" = user.id AND game."scoreSecondPlayer" < game."scoreFirstPlayer" THEN 1
                     ELSE 0 END)`,
        'lossesCount',
      )
      .addSelect(
        `SUM(CASE WHEN game."firstPlayerId" = user.id AND game."scoreFirstPlayer" = game."scoreSecondPlayer" THEN 1
        WHEN game."secondPlayerId" = user.id AND game."scoreFirstPlayer" = game."scoreSecondPlayer" THEN 1
        ELSE 0 END)`,
        'drawsCount',
      )
      .addSelect('user.id', 'id')
      .addSelect('user.login', 'login')
      .addSelect('COUNT(user.id)', 'totalCount')
      .innerJoin(
        User,
        'user',
        'game."firstPlayerId" = user.id OR game."secondPlayerId" = user.id',
      )
      .groupBy('user.id');

    // Добавляем сортировку в запрос
    for (let i = 0; i < sortFields.length; i++) {
      const field = sortFields[i];
      const order = sortOrders[i];
      if (i === 0) queryTypeOrm.orderBy(`"${field}"`, order as 'ASC' | 'DESC');
      else queryTypeOrm.addOrderBy(`"${field}"`, order as 'ASC' | 'DESC');
    }

    queryTypeOrm.offset((pageNumber - 1) * pageSize).limit(pageSize);

    const results = await queryTypeOrm.getRawMany();

    const items = results.map((r) => mapDBStatisticWithUserToViewStatistic(r));

    const totalCount = Number(results[0].totalCount);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount),
      items,
    };
  }
}
