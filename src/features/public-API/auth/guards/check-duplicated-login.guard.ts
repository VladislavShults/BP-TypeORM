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
export class CheckDuplicatedLoginGuard implements CanActivate {
  constructor(private readonly usersRepository: UsersRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const duplicatedLogin = await this.usersRepository.checkUserByLoginInDB(
      request.body.login,
    );

    if (duplicatedLogin)
      throw new BadRequestException(createErrorMessage('login'));
    return true;
  }
}
