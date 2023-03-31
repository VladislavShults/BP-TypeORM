import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '../../../../infrastructure/JWT-utility/jwt-service';
import { UsersQueryRepository } from '../../../SA-API/users/api/users.query.repository';

@Injectable()
export class JWTAuthRefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtUtility: JwtService,
    private readonly userQueryRepo: UsersQueryRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies.refreshToken || null;

    const userId = await this.jwtUtility.extractUserIdFromToken(refreshToken);
    if (!userId) throw new UnauthorizedException();

    const userWithBanInfo = await this.userQueryRepo.getUserByIdWithBanInfo(
      Number(userId),
    );

    if (!userWithBanInfo) throw new UnauthorizedException();

    const user = {
      id: userWithBanInfo.id,
      login: userWithBanInfo.login,
      isBanned: userWithBanInfo.banInfo.isBanned,
    };

    request.user = user;

    return true;
  }
}
