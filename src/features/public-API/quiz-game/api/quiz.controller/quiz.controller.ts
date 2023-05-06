import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/JWT-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { ConnectionCommand } from '../../application/use-cases/connection.use-case';
import { QuizQueryRepository } from '../../../../SA-API/quiz-game/api/quiz-query-repository';
import { CheckUserInActivePairGuard } from '../../guards/check-user-in-active-pair.guard';

@Controller('pair-game-quiz/pairs')
export class QuizController {
  constructor(
    private commandBus: CommandBus,
    private quizGameQueryRepo: QuizQueryRepository,
  ) {}

  @Post('connection')
  @UseGuards(JwtAuthGuard, CheckUserInActivePairGuard)
  async createNewPairOrConnection(@Request() req) {
    const userId = req.user.id;
    const pairId: string = await this.commandBus.execute(
      new ConnectionCommand(userId),
    );
    return this.quizGameQueryRepo.getPairById(pairId);
  }
}
