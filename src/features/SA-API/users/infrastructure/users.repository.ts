import { Injectable } from '@nestjs/common';
import { EmailConfirmationType } from '../types/users.types';
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

  async getUserById(userId: string) {
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
    const account = await this.usersRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.emailConfirmation', 'e')
      .select([
        'u.id',
        'u.login',
        'u.email',
        'e.isConfirmed',
        'e.confirmationCode',
        'e.expirationDate',
      ])
      .where('e."confirmationCode" = :code', { code })
      .getOne();

    if (!account) return null;

    return account;
  }

  async confirmedAccount(code: string): Promise<boolean> {
    // await this.dataSource.query(
    //   `
    // UPDATE public."EmailConfirmation"
    // SET "IsConfirmed"=true
    // WHERE "ConfirmationCode" = $1`,
    //   [code],
    // );
    await this.emailRepo
      .createQueryBuilder()
      .update(EmailConfirmation)
      .set({ isConfirmed: true })
      .where('"confirmationCode" = :code', { code })
      .execute();
    return;
  }

  async checkUserByEmailInDB(email: string): Promise<number | null> {
    const account = await this.usersRepo
      .createQueryBuilder('u')
      .select(['u.id'])
      .where('u.email = :email AND u."isDeleted" = false', { email })
      .getOne();

    if (!account) return null;
    else return Number(account.id);
  }

  async accountIsConfirmed(email: string): Promise<boolean> {
    const account = await this.getAccountWithEmailConfirmationByEmail(email);

    if (!account) return true;

    return account.emailConfirmation.isConfirmed;
  }

  async findByLoginOrEmail(loginOrEmail: string) {
    const accountByLoginOrEmail = await this.usersRepo
      .createQueryBuilder('u')
      .innerJoinAndSelect('u.emailConfirmation', 'e')
      .select([
        'u.id',
        'u.login',
        'u.email',
        'e.isConfirmed',
        'e.confirmationCode',
        'e.expirationDate',
      ])
      .where(
        '"isDeleted" = false AND login = :loginOrEmail OR("isDeleted" = false AND email = :loginOrEmail)',
        { loginOrEmail },
      )
      .getOne();

    if (!accountByLoginOrEmail) return null;

    return accountByLoginOrEmail;
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
    email: string,
    newConfirmationData: { confirmationCode: string; expirationDate: Date },
  ) {
    const account = await this.getAccountWithEmailConfirmationByEmail(email);

    await this.emailRepo.save({
      confirmationCode: newConfirmationData.confirmationCode,
      expirationDate: newConfirmationData.expirationDate,
      userId: account.id,
    });
  }

  async changePassword(newPasswordHash: string, userId: string) {
    await this.usersRepo
      .createQueryBuilder()
      .update(User)
      .set({ passwordHash: newPasswordHash })
      .where('id = :userId', { userId })
      .execute();
  }

  async checkUserByLoginInDB(login: string): Promise<number | null> {
    const account = await this.usersRepo
      .createQueryBuilder('u')
      .select(['u.id'])
      .where('u.login = :login AND u."isDeleted" = false', { login })
      .getOne();

    if (!account) return null;
    else return Number(account.id);
  }

  private getAccountWithEmailConfirmationByEmail = async (email: string) => {
    const account = await this.usersRepo
      .createQueryBuilder('u')
      .innerJoinAndSelect('u.emailConfirmation', 'e')
      .select([
        'u.id',
        'u.login',
        'u.email',
        'e.isConfirmed',
        'e.confirmationCode',
        'e.expirationDate',
      ])
      .where('u.email = :email', { email })
      .getOne();

    if (!account) return null;
    return account;
  };
}
