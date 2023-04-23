import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../../public-API/auth/guards/basic-auth.guard';
import { CreateQuestionDto } from './models/create-question.dto';
import {
  QuestionsWithPagination,
  QuestionViewModel,
} from '../types/quiz.types';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../application/use-cases/create-question-use-case';
import { QuizQueryRepository } from './quiz-query-repository';
import { CheckQuestionInDbGuard } from '../guards/check-question-in-db';
import { UriParamQuestionDto } from './models/uri-param-question-dto';
import { DeleteQuestionByIdCommand } from '../application/use-cases/delete-question-by-id-use-case';
import { UpdateQuestionDto } from './models/update-question.dto';
import { UpdateQuestionByIdCommand } from '../application/use-cases/update-question-by-id-use-case';
import { UpdatePublishQuestionDto } from './models/update-publish-question.dto';
import { UpdatePublishedQuestionByIdCommand } from '../application/use-cases/update-published-question-use-case';
import { QueryQuestionsDto } from './models/query-questions.dto';

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
  async deleteQuestionById(
    @Param() params: UriParamQuestionDto,
  ): Promise<HttpStatus> {
    await this.commandBus.execute(new DeleteQuestionByIdCommand(params));
    return;
  }

  @Put(':id')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard, CheckQuestionInDbGuard)
  async updateQuestionById(
    @Param() params: UriParamQuestionDto,
    @Body() inputModel: UpdateQuestionDto,
  ): Promise<HttpStatus> {
    await this.commandBus.execute(
      new UpdateQuestionByIdCommand(inputModel, params),
    );
    return;
  }

  @Put(':id/publish')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard, CheckQuestionInDbGuard)
  async updatePublishQuestionById(
    @Param() params: UriParamQuestionDto,
    @Body() inputModel: UpdatePublishQuestionDto,
  ): Promise<HttpStatus> {
    await this.commandBus.execute(
      new UpdatePublishedQuestionByIdCommand(inputModel, params),
    );
    return;
  }

  @Get()
  @HttpCode(200)
  @UseGuards(BasicAuthGuard)
  async getAllQuestions(
    @Query() query: QueryQuestionsDto,
  ): Promise<QuestionsWithPagination> {
    return this.quizGameQueryRepo.getAllQuestions(query);
  }
}
