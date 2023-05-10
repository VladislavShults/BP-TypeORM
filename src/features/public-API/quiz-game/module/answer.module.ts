import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from '../entities/quiz-game-answers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Answer])],
  exports: [TypeOrmModule],
})
export class AnswerModule {}
