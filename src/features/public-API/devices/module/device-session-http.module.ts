import { Module } from '@nestjs/common';
import { DeviceSessionModule } from './device-session.module';
import { DevicesService } from '../application/devices.service';
import { DeviceRepository } from '../infrastructure/devices.repository';
import { JwtService } from '../../../../infrastructure/JWT-utility/jwt-service';
import { UsersService } from '../../../SA-API/users/application/users.servive';
import { AuthService } from '../../auth/application/auth.service';
import { UsersRepository } from '../../../SA-API/users/infrastructure/users.repository';
import { UsersQueryRepository } from '../../../SA-API/users/api/users.query.repository';
import { UsersController } from '../../../SA-API/users/api/users.controller';
import { UsersModule } from '../../../SA-API/users/module/users.module';

@Module({
  imports: [DeviceSessionModule, UsersModule],
  providers: [
    DevicesService,
    DeviceRepository,
    JwtService,
    UsersService,
    AuthService,
    UsersRepository,
    UsersQueryRepository,
  ],
  controllers: [UsersController],
})
export class DeviceSessionHttpModule {}
