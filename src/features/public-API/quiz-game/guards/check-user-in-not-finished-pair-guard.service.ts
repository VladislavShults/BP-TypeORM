import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { UserDBType } from '../../../SA-API/users/types/users.types';
import { QuizQueryRepository } from '../../../SA-API/quiz-game/api/quiz-query-repository';

@Injectable()
export class CheckUserInNotFinishedPairGuard implements CanActivate {
  constructor(private readonly quizGameRepo: QuizQueryRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const user: UserDBType = request.user as UserDBType;

    const userId = user.id.toString();

    const activePair = await this.quizGameRepo.findNotFinishedPair(userId);

    if (activePair) throw new ForbiddenException();

    return true;
  }
}
