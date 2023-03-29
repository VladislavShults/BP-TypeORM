import { Module } from '@nestjs/common';
import { IpRestrictionModule } from './ip-restriction.module';
import { UsersRepository } from '../../SA-API/users/infrastructure/users.repository';
import { UsersModule } from '../../SA-API/users/module/users.module';

@Module({
  imports: [IpRestrictionModule, UsersModule],
  providers: [UsersRepository],
  controllers: [],
})
export class IpRestrictionHttpModule {}
