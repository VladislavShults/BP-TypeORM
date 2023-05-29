import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QuizGameRepository } from '../../../../SA-API/quiz-game/infrastructure/quizGame.repository';

@Injectable()
export class FinishedGameAboutTenSecUseCase {
  constructor(private quizGameRepository: QuizGameRepository) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    await this.quizGameRepository.finishedGameAboutTenSec();
  }
}
