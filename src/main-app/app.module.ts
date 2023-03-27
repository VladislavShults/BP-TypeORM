import { UsersModule } from '../features/SA-API/users/module/users.module';
import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsPlatformModule } from '../infrastructure/modules/blogsPlatformModule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceSessionModule } from '../features/public-API/devices/module/device-session.module';
import { User } from '../features/SA-API/users/entities/user.entity';

let urlSQL = process.env.POSTGRES_URL;
if (process.env.dev === 'local1') {
  urlSQL = process.env.POSTGRES_URL2;
  console.log('localDB');
}

@Module({
  imports: [
    BlogsPlatformModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: urlSQL,
      port: 5432,
      autoLoadEntities: true,
      synchronize: true,
      ssl: true,
      entities: [User],
    }),
    UsersModule,
    DeviceSessionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
