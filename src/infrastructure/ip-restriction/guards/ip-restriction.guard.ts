import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../../features/SA-API/users/entities/user.entity';
import { IpRestriction } from '../../../features/ip-restriction/entities/ip-restriction.entity';

@Injectable()
export class IpRestrictionGuard implements CanActivate {
  constructor(
    @InjectRepository(IpRestriction)
    private ipRestrictionRepo: Repository<IpRestriction>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const url = request.url;
    const ip = request.ip;

    const time = new Date(new Date().getTime() - 11500);

    const inputCount = await this.ipRestrictionRepo
      .createQueryBuilder()
      .where(`url = :url AND "currentIp" = :ip AND "entryTime" > :time`, {
        url,
        ip,
        time,
      })
      .getManyAndCount();

    if (inputCount[1] >= 5)
      throw new HttpException('ip-restriction', HttpStatus.TOO_MANY_REQUESTS);

    await this.ipRestrictionRepo.save({
      url,
      currentIp: ip,
      entryTime: new Date(),
    });

    await this.ipRestrictionRepo
      .createQueryBuilder()
      .delete()
      .from(IpRestriction)
      .where('"entryTime" < :time', { time })
      .execute();

    return true;
  }
}
