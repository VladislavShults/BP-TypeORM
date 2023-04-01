import { Module } from '@nestjs/common';
import { BlogsModule } from './blog.module';

@Module({
  imports: [BlogsModule],
  providers: [],
  controllers: [],
})
export class BlogHttpModule {}
