import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
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
  GamePairViewModel,
} from '../../../../SA-API/quiz-game/types/quiz.types';
import { CheckActivePairByIdAndUserIdGuard } from '../../guards/check-user-in-active-pair';
import { AnswerInputModelDto } from '../models/answer-input-model.dto';
import { filterResponsesFromAGivenUser } from '../../helpers/filterResponsesFromAGivenUser';
import { GiveAnAnswerCommand } from '../../application/use-cases/give-an-answer.use-case';

@Controller('pair-game-quiz/pairs')
export class QuizController {
  constructor(
    private commandBus: CommandBus,
    private quizGameQueryRepo: QuizQueryRepository,
  ) {}

  @Post('connection')
  @UseGuards(JwtAuthGuard, CheckUserInNotFinishedPairGuard)
  async createNewPairOrConnection(@Request() req): Promise<GamePairViewModel> {
    const userId = req.user.id;

    const pairId: string = await this.commandBus.execute(
      new ConnectionCommand(userId),
    );

    return this.quizGameQueryRepo.getPairById(pairId);
  }

  @Get('my-current')
  @UseGuards(JwtAuthGuard)
  async getCurrentNotFinishedGame(@Request() req): Promise<GamePairViewModel> {
    const userId: string = req.user.id.toString();

    const activeGame = await this.quizGameQueryRepo.findNotFinishedPair(userId);

    if (!activeGame) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);

    return this.quizGameQueryRepo.getPairById(activeGame.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getAllStatusGameById(
    @Param() params: { id: string },
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

  @Post('my-current/answers')
  @UseGuards(JwtAuthGuard, CheckActivePairByIdAndUserIdGuard)
  async createAnswer(
    @Body() inputModel: AnswerInputModelDto,
    @Request() req,
  ): Promise<AnswersViewModel> {
    const userId = req.user.id;

    const activeGame = await this.quizGameQueryRepo.findNotFinishedPair(userId);

    const answersAboutUser = filterResponsesFromAGivenUser(activeGame, userId);

    if (answersAboutUser.length >= 5)
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    return this.commandBus.execute(
      new GiveAnAnswerCommand(
        activeGame,
        userId,
        inputModel.answer,
        answersAboutUser,
      ),
    );
  }
}
