import { Module } from '@nestjs/common';
import { QuizGameQuestionModule } from './quizGameQuestion.module';

@Module({
  imports: [QuizGameQuestionModule],
  providers: [],
  controllers: [],
})
export class QuizGameQuestionHttpModule {}
