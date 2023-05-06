import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizGame } from '../entities/quiz-game.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuizGame])],
  exports: [TypeOrmModule],
})
export class QuizGameModule {}
