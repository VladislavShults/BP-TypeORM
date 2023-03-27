import { Injectable } from '@nestjs/common';
import { addHours } from 'date-fns';
import { CreateUserDto } from '../api/models/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { EmailConfirmationType } from '../types/users.types';
import { BanUserDto } from '../api/models/ban-user.dto';
import { AuthService } from '../../../public-API/auth/application/auth.service';
import { UsersQueryRepository } from '../api/users.query.repository';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { BanInfo } from '../entities/ban-info.entity';
import { EmailConfirmation } from '../entities/email-confirmation.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async createUser(
    inputModel: CreateUserDto,
  ): Promise<{ userId: string; confirmationCode: string }> {
    const hash = await this.authService.generateHash(inputModel.password);

    const confirmationCode = uuidv4();

    const user = new User();
    user.login = inputModel.login;
    user.email = inputModel.email;
    user.createdAt = new Date();
    user.passwordHash = hash;
    user.isDeleted = false;
    user.isBanned = false;

    const userId = await this.usersRepository.createUser(user);

    const emailConfirmation = new EmailConfirmation();
    emailConfirmation.confirmationCode = confirmationCode;
    emailConfirmation.expirationDate = addHours(new Date(), 5);
    emailConfirmation.isConfirmed = false;
    emailConfirmation.userId = userId;

    await this.usersRepository.saveEmailConfirmation(emailConfirmation);

    const banInfo = new BanInfo();
    banInfo.isBanned = false;
    banInfo.banDate = null;
    banInfo.banReason = null;
    banInfo.userId = userId;

    await this.usersRepository.createBanInfoForUser(banInfo);

    return { userId, confirmationCode };
  }

  async deleteUserById(userId: string): Promise<boolean> {
    const user = await this.usersRepository.getUser(userId);

    if (!user || user.isDeleted) return false;

    return await this.usersRepository.deleteUserById(userId);
  }

  async banAndUnbanUser(
    userId: string,
    banModel: BanUserDto,
  ): Promise<boolean> {
    const user = await this.usersQueryRepository.getUserByIdWithBanInfo(userId);

    if (!user) return false;

    if (banModel.isBanned && !user.banInfo.isBanned) {
      const banInfo = {
        isBanned: banModel.isBanned,
        banDate: new Date(),
        banReason: banModel.banReason,
      };

      await this.usersRepository.banOrUnbanUser(userId, banInfo);

      return;
    }
    if (!banModel.isBanned && user.banInfo.isBanned) {
      const banInfo = {
        isBanned: banModel.isBanned,
        banDate: null,
        banReason: null,
      };
      await this.usersRepository.banOrUnbanUser(userId, banInfo);

      return;
    }
  }

  async findUserByLoginOrEmail(loginOrEmail: string) {
    return this.usersRepository.findByLoginOrEmail(loginOrEmail);
  }

  async findUserById(userId: string) {
    return this.usersRepository.getUser(userId);
  }
}
