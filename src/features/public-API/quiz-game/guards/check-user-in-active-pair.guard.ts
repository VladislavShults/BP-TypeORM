import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { QuizGameRepository } from '../../../SA-API/quiz-game/infrastructure/quizGame.repository';
import { UserDBType } from '../../../SA-API/users/types/users.types';

@Injectable()
export class CheckUserInActivePairGuard implements CanActivate {
  constructor(private readonly quizGameRepo: QuizGameRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const user: UserDBType = request.user as UserDBType;

    const userId = user.id.toString();

    const activePair = await this.quizGameRepo.findActivePair(userId);

    if (activePair) throw new ForbiddenException();

    return true;
  }
}
