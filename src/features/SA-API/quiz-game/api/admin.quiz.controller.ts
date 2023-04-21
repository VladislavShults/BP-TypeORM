import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { BasicAuthGuard } from '../../../public-API/auth/guards/basic-auth.guard';
import { CreateQuestionDto } from './models/create-question.dto';
import { QuestionViewModel } from '../types/quiz.types';

@Controller('sa/quiz/questions')
export class AdminQuizGameController {
  // constructor() {}

  @Post()
  @HttpCode(201)
  @UseGuards(BasicAuthGuard)
  async createQuestion(
    @Body() inputModel: CreateQuestionDto,
  ): Promise<QuestionViewModel> {
    return;
  }
}
