import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizGameQuestion } from '../entities/quiz-game-question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuizGameQuestion])],
  exports: [TypeOrmModule],
})
export class QuizGameQuestionModule {}
