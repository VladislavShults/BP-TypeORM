import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { QuizQueryRepository } from '../api/quiz-query-repository';

@Injectable()
export class CheckQuestionInDbGuard implements CanActivate {
  constructor(private readonly quizQueryRepository: QuizQueryRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    try {
      const question = await this.quizQueryRepository.getQuestionById(
        request.params.id,
      );

      if (!question)
        throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
    } catch (err) {
      throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
    }

    return true;
  }
}
