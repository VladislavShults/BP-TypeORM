import { Injectable } from '@nestjs/common';
import {
  DevicesResponseType,
  DevicesSecuritySessionType,
} from '../types/devices.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceSession } from '../entities/device-session.entity';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectRepository(DeviceSession)
    private deviceRepo: Repository<DeviceSession>,
  ) {}
  async getActiveSessionCurrentUser(
    userId: string,
  ): Promise<DevicesResponseType[]> {
    const activeSessions: DevicesSecuritySessionType[] = await this.deviceRepo
      .createQueryBuilder()
      .where('"userId" = :userId', { userId })
      .getMany();

    return activeSessions.map((session) => ({
      ip: session.ip,
      title: session.deviceName,
      lastActiveDate: session.lastActiveDate,
      deviceId: session.deviceId,
    }));
  }
}
