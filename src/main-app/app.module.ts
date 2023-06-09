import { UsersModule } from '../features/SA-API/users/module/users.module';
import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsPlatformModule } from '../infrastructure/modules/blogsPlatformModule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceSessionModule } from '../features/public-API/devices/module/device-session.module';
import { User } from '../features/SA-API/users/entities/user.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { QuizGame } from '../features/public-API/quiz-game/entities/quiz-game.entity';
import { Answer } from '../features/public-API/quiz-game/entities/quiz-game-answers.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpExceptionFilter } from '../exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Wallpaper } from '../features/public-API/blogs/entities/wallpaper.entity';
import { BlogMainImage } from '../features/public-API/blogs/entities/main-image.entity';
import { PostMainImage } from '../features/public-API/posts/entities/post-main-image.entity';

dotenv.config();

let urlSQL: string;
if (process.env.dev === 'local1') {
  urlSQL = process.env.POSTGRES_URL2;
  console.log('localDB');
} else {
  urlSQL = process.env.POSTGRES_URL;
  console.log('cloudDB');
}

@Module({
  imports: [
    BlogsPlatformModule,
    CqrsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: urlSQL,
      port: 5432,
      autoLoadEntities: true,
      synchronize: true,
      ssl: true,
      entities: [
        User,
        QuizGame,
        Answer,
        Wallpaper,
        BlogMainImage,
        PostMainImage,
      ],
      // logging: true,
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    DeviceSessionModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
