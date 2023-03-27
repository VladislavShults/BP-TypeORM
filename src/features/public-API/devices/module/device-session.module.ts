import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceSession } from '../entities/device-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceSession])],
  exports: [TypeOrmModule],
})
export class DeviceSessionModule {}
