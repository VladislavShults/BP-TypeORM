import { Injectable } from '@nestjs/common';
import {
  UsersJoinEmailConfirmationType,
  ViewUsersTypeWithPagination,
} from '../types/users.types';
import { QueryUserDto } from './models/query-user.dto';
import { mapUserDBTypeToViewType } from '../helpers/mapUserDBTypeToViewType';
import { InfoAboutMeType } from '../../../public-API/auth/types/info-about-me-type';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { BanInfo } from '../entities/ban-info.entity';
import { EmailConfirmation } from '../entities/email-confirmation.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(BanInfo) private banInfoRepo: Repository<BanInfo>,
    @InjectRepository(EmailConfirmation)
    private emailRepo: Repository<EmailConfirmation>,
  ) {}

  async getUsers(query: QueryUserDto): Promise<ViewUsersTypeWithPagination> {
    const banStatus: string = query.banStatus || 'all';
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'ASC' | 'DESC' = query.sortDirection || 'DESC';
    const searchLoginTerm: string | null = query.searchLoginTerm || '';
    const searchEmailTerm: string | null = query.searchEmailTerm || '';

    let stringWhere =
      'LOWER(login) like :loginTerm AND "isDeleted" = false OR (Lower(email) like :emailTerm AND "isDeleted" = false)';

    if (banStatus === 'banned') {
      stringWhere =
        'LOWER(login) like :loginTerm AND "isDeleted" = false AND u."isBanned" = true OR (Lower(email) like :emailTerm AND "isDeleted" = false AND u."isBanned" = true)';
    }

    if (banStatus === 'notBanned') {
      stringWhere =
        'LOWER(login) like :loginTerm AND "isDeleted" = false AND u."isBanned" = false OR (Lower(email) like :emailTerm AND "isDeleted" = false AND u."isBanned" = false)';
    }

    const res = await this.usersRepo
      .createQueryBuilder('u')
      .innerJoinAndSelect('u.banInfo', 'b')
      .select([
        'u.id',
        'u.login',
        'u.email',
        'u.createdAt',
        'b.isBanned',
        'b.banDate',
        'b.banReason',
      ])
      .where(stringWhere, {
        loginTerm: `%${searchLoginTerm.toLocaleLowerCase()}%`,
        emailTerm: `%${searchEmailTerm.toLocaleLowerCase()}%`,
      })
      .limit(pageSize)
      .orderBy('"' + sortBy + '"', sortDirection)
      .offset((pageNumber - 1) * pageSize)
      .getManyAndCount();

    const totalCount = Number(res[1]);

    const pagesCount = Math.ceil(totalCount / pageSize);

    const items = res[0].map((i) => mapUserDBTypeToViewType(i));

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }

  async returnInfoAboutMe(userId: number): Promise<InfoAboutMeType> {
    const userById = await this.getUserByIdJoinEmailConfirmationType(userId);
    return {
      email: userById.email,
      login: userById.login,
      userId: userById.id.toString(),
    };
  }

  async getUserByIdWithBanInfo(
    userId: number,
  ): Promise<Omit<User, 'emailConfirmation'> | null> {
    const result = await this.usersRepo
      .createQueryBuilder('u')
      .innerJoinAndSelect('u.banInfo', 'b')
      .where('u.id = :userId', { userId })
      .select([
        'u.id',
        'u.login',
        'u.email',
        'u.createdAt',
        'b.isBanned',
        'b.banDate',
        'b.banReason',
      ])
      .getOne();

    result.id = result.id.toString();

    return result;
  }

  async getUserByIdJoinEmailConfirmationType(
    userId: number,
  ): Promise<UsersJoinEmailConfirmationType> {
    const userSQLType = await this.dataSource.query(
      `
    SELECT u."UserId" as "id", u."Login" as "login", u."Email" as "email",
           e."IsConfirmed" as "isConfirmed", e."ConfirmationCode" as "confirmationCode",
           e."ExpirationDate" as "expirationDate"
    FROM public."Users" u
    JOIN public."EmailConfirmation" e
    ON u."UserId" = e."UserId"
    WHERE "IsDeleted" = false AND u."UserId" = $1
    `,
      [userId],
    );

    if (!userSQLType) return null;

    return userSQLType[0];
  }
}
