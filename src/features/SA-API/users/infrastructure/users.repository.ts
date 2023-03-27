import { Injectable } from '@nestjs/common';
import {
  EmailConfirmationType,
  UserForTypeOrmType,
  UsersJoinEmailConfirmationType,
} from '../types/users.types';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { BanInfo } from '../entities/ban-info.entity';
import { EmailConfirmation } from '../entities/email-confirmation.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(BanInfo) private banInfoRepo: Repository<BanInfo>,
    @InjectRepository(EmailConfirmation)
    private emailRepo: Repository<EmailConfirmation>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async deleteUserById(userId: string): Promise<boolean> {
    await this.usersRepo
      .createQueryBuilder()
      .update(User)
      .set({ isDeleted: true })
      .where('id = :userId', { userId })
      .execute();

    return true;
  }

  async getUser(userId: string) {
    try {
      const user = await this.usersRepo
        .createQueryBuilder('u')
        .where('u.id = :userId', { userId })
        .select(['u.id', 'u.isDeleted'])
        .getOne();

      if (!user) return null;
      return user;
    } catch (error) {
      return null;
    }
  }

  async findAccountByConfirmationCode(code: string) {
    const account = await this.dataSource.query(
      `
    SELECT "ExpirationDate" as "expirationDate", "IsConfirmed" as "isConfirmed", "UserId" as "userId"
    FROM public."EmailConfirmation"
    WHERE "ConfirmationCode" = $1`,
      [code],
    );

    if (account.length === 0) return null;

    return account[0];
  }

  async confirmedAccount(code: string): Promise<boolean> {
    await this.dataSource.query(
      `
    UPDATE public."EmailConfirmation"
    SET "IsConfirmed"=true
    WHERE "ConfirmationCode" = $1`,
      [code],
    );
    return;
  }

  async checkUserByEmailInDB(email: string): Promise<number | null> {
    const account = await this.dataSource.query(
      `
    SELECT u."UserId" as "id", u."Login" as "login", u."Email" as "email",
           e."IsConfirmed" as "isConfirmed", e."ConfirmationCode" as "confirmationCode",
           e."ExpirationDate" as "expirationDate"
    FROM public."Users" u
    JOIN public."EmailConfirmation" e
    ON u."UserId" = e."UserId"
    WHERE "IsDeleted" = false AND "Email" = $1
    `,
      [email],
    );
    if (account.length === 0) return null;
    else return account[0].id;
  }

  async accountIsConfirmed(email: string): Promise<boolean> {
    const account: UsersJoinEmailConfirmationType[] =
      await this.dataSource.query(
        `
    SELECT u."UserId" as "id", u."Login" as "login", u."Email" as "email",
           e."IsConfirmed" as "isConfirmed", e."ConfirmationCode" as "confirmationCode",
           e."ExpirationDate" as "expirationDate"
    FROM public."Users" u
    JOIN public."EmailConfirmation" e
    ON u."UserId" = e."UserId"
    WHERE "IsDeleted" = false AND "Email" = $1`,
        [email],
      );

    if (account.length === 0) return true;

    return account[0].isConfirmed;
  }

  async findByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UsersJoinEmailConfirmationType | null> {
    const accountByLoginOrEmail = await this.dataSource.query(
      `
    SELECT u."UserId" as "id", u."Login" as "login", u."Email" as "email",
           e."ConfirmationCode" as "confirmationCode"
    FROM public."Users" u
    JOIN public."EmailConfirmation" e
    ON u."UserId" = e."UserId"
    WHERE u."IsDeleted" = false AND u."Login" = $1
    OR(u."IsDeleted" = false AND u."Email" = $1)`,
      [loginOrEmail],
    );

    if (accountByLoginOrEmail.length === 0) return null;

    return accountByLoginOrEmail[0];
  }

  async saveEmailConfirmation(
    emailConfirmation: EmailConfirmationType,
  ): Promise<void> {
    await this.emailRepo.save(emailConfirmation);
  }

  async createUser(user: Omit<User, 'id'>): Promise<string> {
    const newUser = await this.usersRepo.save(user);
    return newUser.id;
  }

  async createBanInfoForUser(banInfo: Omit<BanInfo, 'user'>): Promise<void> {
    await this.banInfoRepo.save(banInfo);
  }

  async banOrUnbanUser(
    userId: string,
    banInfo: { isBanned: boolean; banDate: Date; banReason: string },
  ): Promise<void> {
    await this.banInfoRepo
      .createQueryBuilder()
      .update(BanInfo)
      .set({
        isBanned: banInfo.isBanned,
        banDate: banInfo.banDate,
        banReason: banInfo.banReason,
      })
      .where('userId = :userId', { userId })
      .execute();

    await this.usersRepo
      .createQueryBuilder()
      .update(User)
      .set({ isBanned: banInfo.isBanned })
      .where('id = :userId', { userId })
      .execute();
  }

  async refreshConfirmationCodeAndDate(
    userId: number,
    newConfirmationData: { confirmationCode: string; expirationDate: Date },
  ) {
    await this.dataSource.query(
      `
    UPDATE public."EmailConfirmation"
    SET "ConfirmationCode"=$1, "ExpirationDate"=$2
    WHERE "UserId" = $3;`,
      [
        newConfirmationData.confirmationCode,
        newConfirmationData.expirationDate,
        userId,
      ],
    );
  }

  async changePassword(newPasswordHash: string, userId: string) {
    await this.dataSource.query(
      `
    UPDATE public."Users"
    SET "PasswordHash"=$1
    WHERE "UserId" = $2;`,
      [newPasswordHash, userId],
    );
  }
}
