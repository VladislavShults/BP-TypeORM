import { Module } from '@nestjs/common';
import { AnswerModule } from './answer.module';

@Module({
  imports: [AnswerModule],
  providers: [],
  controllers: [],
})
export class AnswerHttpModule {}
