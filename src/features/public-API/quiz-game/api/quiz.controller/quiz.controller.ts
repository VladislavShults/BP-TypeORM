import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/JWT-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { ConnectionCommand } from '../../application/use-cases/connection.use-case';

@Controller('pair-game-quiz/pairs')
export class QuizController {
  constructor(private commandBus: CommandBus) {}

  @Post('connection')
  @UseGuards(JwtAuthGuard)
  async createNewPairOrConnection(@Request() req) {
    const userId = req.user.id;
    const pairId = await this.commandBus.execute(new ConnectionCommand(userId));
  }
}
