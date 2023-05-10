import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/JWT-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { ConnectionCommand } from '../../application/use-cases/connection.use-case';
import { QuizQueryRepository } from '../../../../SA-API/quiz-game/api/quiz-query-repository';
import { CheckUserInActivePairGuard } from '../../guards/check-user-in-active-pair.guard';
import { GamePairViewModel } from '../../../../SA-API/quiz-game/types/quiz.types';

@Controller('pair-game-quiz/pairs')
export class QuizController {
  constructor(
    private commandBus: CommandBus,
    private quizGameQueryRepo: QuizQueryRepository,
  ) {}

  @Post('connection')
  @UseGuards(JwtAuthGuard, CheckUserInActivePairGuard)
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

    const activeGameId = await this.quizGameQueryRepo.findActivePair(userId);

    if (!activeGameId)
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);

    return this.quizGameQueryRepo.getPairById(activeGameId.id);
  }
}
