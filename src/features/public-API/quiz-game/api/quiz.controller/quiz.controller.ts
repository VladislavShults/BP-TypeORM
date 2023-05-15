import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/JWT-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { ConnectionCommand } from '../../application/use-cases/connection.use-case';
import { QuizQueryRepository } from '../../../../SA-API/quiz-game/api/quiz-query-repository';
import { CheckUserInNotFinishedPairGuard } from '../../guards/check-user-in-not-finished-pair-guard.service';
import {
  AnswersViewModel,
  GamePairsViewModelWithPagination,
  GamePairViewModel,
  Statistic,
} from '../../../../SA-API/quiz-game/types/quiz.types';
import { CheckActivePairByIdAndUserIdGuard } from '../../guards/check-user-in-active-pair';
import { AnswerInputModelDto } from '../models/answer-input-model.dto';
import { GiveAnAnswerCommand } from '../../application/use-cases/give-an-answer.use-case';
import { GetAnswerInputModelDTO } from '../models/get-answer-input-model.DTO';
import { QueryGameDTO } from '../models/query-game.DTO';

@Controller('pair-game-quiz')
export class QuizController {
  constructor(
    private commandBus: CommandBus,
    private quizGameQueryRepo: QuizQueryRepository,
  ) {}

  @Get('pairs/my')
  @UseGuards(JwtAuthGuard)
  async getAllMyGames(
    @Query() query: QueryGameDTO,
    @Request() req,
  ): Promise<GamePairsViewModelWithPagination> {
    const userId: string = req.user.id.toString();

    return this.quizGameQueryRepo.getAllPairsByUserId(userId, query);
  }

  @Get('pairs/my-statistic')
  @UseGuards(JwtAuthGuard)
  async getStatistic(@Request() req): Promise<Statistic> {
    const userId: string = req.user.id.toString();

    return this.quizGameQueryRepo.getStatistic(userId);
  }

  @Get('users/my-statistic')
  @UseGuards(JwtAuthGuard)
  async getStatisticUser(@Request() req): Promise<Statistic> {
    const userId: string = req.user.id.toString();

    return this.quizGameQueryRepo.getStatistic(userId);
  }

  @Post('pairs/connection')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, CheckUserInNotFinishedPairGuard)
  async createNewPairOrConnection(@Request() req): Promise<GamePairViewModel> {
    const userId = req.user.id;

    const pairId: string = await this.commandBus.execute(
      new ConnectionCommand(userId),
    );

    return this.quizGameQueryRepo.getPairById(pairId);
  }

  @Get('pairs/my-current')
  @UseGuards(JwtAuthGuard)
  async getCurrentNotFinishedGame(@Request() req): Promise<GamePairViewModel> {
    const userId: string = req.user.id.toString();

    const activeGame = await this.quizGameQueryRepo.findNotFinishedPair(userId);

    if (!activeGame) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);

    return this.quizGameQueryRepo.getPairById(activeGame.id);
  }

  @Get('pairs/:id')
  @UseGuards(JwtAuthGuard)
  async getAllStatusGameById(
    @Param() params: GetAnswerInputModelDTO,
    @Request() req,
  ): Promise<GamePairViewModel> {
    const userId: string = req.user.id.toString();

    const game = await this.quizGameQueryRepo.findAllStatusGameById(params.id);

    if (!game) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);

    if (game.firstPlayerId == userId || game.secondPlayerId == userId)
      return this.quizGameQueryRepo.getPairById(game.id);
    else {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  @Post('pairs/my-current/answers')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, CheckActivePairByIdAndUserIdGuard)
  async createAnswer(
    @Body() inputModel: AnswerInputModelDto,
    @Request() req,
  ): Promise<AnswersViewModel> {
    const userId = req.user.id;

    return this.commandBus.execute(
      new GiveAnAnswerCommand(userId, inputModel.answer),
    );
  }
}
