import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { BanInfo } from '../entities/ban-info.entity';
import { EmailConfirmation } from '../entities/email-confirmation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, BanInfo, EmailConfirmation])],
  exports: [TypeOrmModule],
})
export class UsersModule {}
