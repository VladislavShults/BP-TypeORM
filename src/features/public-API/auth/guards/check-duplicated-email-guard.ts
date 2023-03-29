import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { createErrorMessage } from '../helpers/create-error-message';
import { UsersRepository } from '../../../SA-API/users/infrastructure/users.repository';

@Injectable()
export class CheckDuplicatedEmailGuard implements CanActivate {
  constructor(private readonly usersRepository: UsersRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const duplicatedEmailArray =
      await this.usersRepository.checkUserByEmailInDB(request.body.email);

    if (duplicatedEmailArray)
      throw new BadRequestException(createErrorMessage('email'));
    return true;
  }
}
