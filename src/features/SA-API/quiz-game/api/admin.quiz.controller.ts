import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { BasicAuthGuard } from '../../../public-API/auth/guards/basic-auth.guard';
import { CreateQuestionDto } from './models/create-question.dto';
import { QuestionViewModel } from '../types/quiz.types';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../application/use-cases/createQuestionUseCase';

@Controller('sa/quiz/questions')
export class AdminQuizGameController {
  constructor(private commandBus: CommandBus) {}

  @Post()
  @HttpCode(201)
  @UseGuards(BasicAuthGuard)
  async createQuestion(
    @Body() inputModel: CreateQuestionDto,
  ): Promise<QuestionViewModel> {
    const result = await this.commandBus.execute(
      new CreateQuestionCommand(inputModel),
    );
    return result;
  }
}
