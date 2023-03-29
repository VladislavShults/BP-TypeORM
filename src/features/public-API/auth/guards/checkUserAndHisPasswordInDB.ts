import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersForCheckInDB } from '../../../SA-API/users/types/users.types';
import { Request } from 'express';
import { AuthService } from '../application/auth.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../../SA-API/users/entities/user.entity';

@Injectable()
export class CheckUserAndHisPasswordInDB implements CanActivate {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private readonly authService: AuthService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    let user: UsersForCheckInDB | null = null;

    const loginOrEmail = request.body.loginOrEmail;

    // const accountByLoginOrEmail = await this.dataSource.query(
    //   `
    // SELECT u."UserId" as "userId", u."Login" as "login", u."Email" as "email", u."PasswordHash" as "passwordHash",
    //        b."IsBanned" as "isBanned"
    // FROM public."Users" u
    // JOIN public."BanInfo" b
    // ON u."UserId" = b."UserId"
    // WHERE u."IsDeleted" = false AND u."Login" = $1
    // OR(u."IsDeleted" = false AND u."Email" = $1)`,
    //   [request.body.loginOrEmail],
    // );
    const accountByLoginOrEmail = await this.usersRepo
      .createQueryBuilder()
      .select([
        'id as "userId"',
        'login',
        'email',
        '"passwordHash"',
        '"isBanned"',
      ])
      .where(
        '"isDeleted" = false AND login = :loginOrEmail OR("isDeleted" = false AND email = :loginOrEmail)',
        { loginOrEmail },
      )
      .getRawOne();

    if (accountByLoginOrEmail) {
      user = accountByLoginOrEmail;
    } else throw new HttpException('', HttpStatus.UNAUTHORIZED);

    const passwordValid = await this.authService.isPasswordCorrect(
      request.body.password,
      user.passwordHash,
    );
    if (!passwordValid || user.isBanned)
      throw new HttpException('', HttpStatus.UNAUTHORIZED);

    request.user = user;

    return true;
  }
}
