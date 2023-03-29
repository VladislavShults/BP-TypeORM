import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IpRestriction } from '../entities/ip-restriction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IpRestriction])],
  exports: [TypeOrmModule],
})
export class IpRestrictionModule {}
