import { Injectable } from '@nestjs/common';
import { DevicesSecuritySessionType } from '../types/devices.types';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DeviceSession } from '../entities/device-session.entity';

@Injectable()
export class DeviceRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(DeviceSession)
    private deviceRepo: Repository<DeviceSession>,
  ) {}

  async deleteDeviceSession(userId: string, deviceId: string) {
    await this.deviceRepo.delete({ userId: Number(userId), deviceId });
  }

  async findDeviceByIssueAtAndUserId(
    issueAt: string,
    userId: string,
  ): Promise<boolean> {
    const deviceId = await this.deviceRepo
      .createQueryBuilder()
      .where('"userId" = :userId AND "issuedAt" = :issueAt', {
        userId,
        issueAt,
      })
      .getOne();

    return !!deviceId;
  }

  async terminateAllSessionExceptThis(userId: string, deviceId: string) {
    await this.dataSource.query(
      `
        DELETE FROM public."DeviceSession"
        WHERE "DeviceId" NOT IN ($1) AND "UserId" = $2`,
      [deviceId, userId],
    );
  }

  async getSessionByDeviceId(
    deviceId: string,
  ): Promise<DevicesSecuritySessionType[] | null> {
    return this.dataSource.query(
      `
    SELECT "DeviceSessionId" as "deviceSessionId", "DeviceId" as "deviceId", "Ip" as "ip", "DeviceName" as "deviceName",
            "UserId" as "userId", "LastActiveDate" as "lastActiveDate", "ExpiresAt" as "expiresAt", "IssuedAt" as "issuedAt"
    FROM public."DeviceSession"
    WHERE "DeviceId" = $1`,
      [deviceId],
    );
  }

  async saveDeviceInputInDB(
    newInput: Omit<DevicesSecuritySessionType, 'deviceSessionId'>,
  ): Promise<void> {
    await this.deviceRepo.save(newInput);
  }

  async changeRefreshTokenInDeviceSession(
    issuedAtOldToken: string,
    userIdOldToken: string,
    issuedAtNewToken: string,
    expiresAtNewToken: string,
    ip: string,
  ) {
    try {
      await this.deviceRepo
        .createQueryBuilder()
        .update(DeviceSession)
        .set({ ip, issuedAt: issuedAtNewToken, expiresAt: expiresAtNewToken })
        .where(
          '"issuedAt" = :issuedAtOldToken AND "userId" = :userIdOldToken',
          { issuedAtOldToken, userIdOldToken },
        )
        .execute();
    } catch (error) {
      return null;
    }
  }
}
