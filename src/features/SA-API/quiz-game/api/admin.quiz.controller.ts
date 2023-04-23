import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../../public-API/auth/guards/basic-auth.guard';
import { CreateQuestionDto } from './models/create-question.dto';
import { QuestionViewModel } from '../types/quiz.types';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../application/use-cases/createQuestionUseCase';
import { QuizQueryRepository } from './quiz-query-repository';
import { CheckQuestionInDbGuard } from '../guards/check-question-in-db';
import { UriParamQuestionDto } from './models/uri-param-question-dto';
import { DeleteQuestionByIdCommand } from '../application/use-cases/delete-question-by-id';

@Controller('sa/quiz/questions')
export class AdminQuizGameController {
  constructor(
    private commandBus: CommandBus,
    private quizGameQueryRepo: QuizQueryRepository,
  ) {}

  @Post()
  @HttpCode(201)
  @UseGuards(BasicAuthGuard)
  async createQuestion(
    @Body() inputModel: CreateQuestionDto,
  ): Promise<QuestionViewModel> {
    const resultId: string = await this.commandBus.execute(
      new CreateQuestionCommand(inputModel),
    );
    return this.quizGameQueryRepo.getQuestionById(resultId);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard, CheckQuestionInDbGuard)
  async deleteCommentById(
    @Param() params: UriParamQuestionDto,
  ): Promise<HttpStatus> {
    await this.commandBus.execute(new DeleteQuestionByIdCommand(params));
    return;
  }
}
