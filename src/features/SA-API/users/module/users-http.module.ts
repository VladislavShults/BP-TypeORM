import { UsersModule } from './users.module';
import { Module } from '@nestjs/common';
import { DevicesService } from '../../../public-API/devices/application/devices.service';
import { DeviceRepository } from '../../../public-API/devices/infrastructure/devices.repository';
import { JwtService } from '../../../../infrastructure/JWT-utility/jwt-service';
import { AuthService } from '../../../public-API/auth/application/auth.service';
import { UsersQueryRepository } from '../api/users.query.repository';
import { UsersService } from '../application/users.servive';
import { UsersRepository } from '../infrastructure/users.repository';
import { UsersController } from '../api/users.controller';

@Module({
  imports: [UsersModule],
  providers: [
    DevicesService,
    DeviceRepository,
    JwtService,
    AuthService,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
  ],
  controllers: [UsersController],
})
export class UserHttpModule {}
