import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { QuizQueryRepository } from '../../../SA-API/quiz-game/api/quiz-query-repository';
import { Request } from 'express';
import { UserDBType } from '../../../SA-API/users/types/users.types';

@Injectable()
export class CheckActivePairByIdAndUserIdGuard implements CanActivate {
  constructor(private readonly quizGameRepo: QuizQueryRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const user: UserDBType = request.user as UserDBType;

    const userId = user.id.toString();

    const activePair = await this.quizGameRepo.findActivePairByUserId(userId);

    if (!activePair) throw new ForbiddenException();

    return true;
  }
}
