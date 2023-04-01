import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from '../entities/blog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Blog])],
  exports: [TypeOrmModule],
})
export class BlogsModule {}
