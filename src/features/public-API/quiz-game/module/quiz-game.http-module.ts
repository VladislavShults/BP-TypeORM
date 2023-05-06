import { Module } from '@nestjs/common';
import { QuizGameModule } from './quiz-game.module';

@Module({
  imports: [QuizGameModule],
  providers: [],
  controllers: [],
})
export class QuizGameHttpModule {}
