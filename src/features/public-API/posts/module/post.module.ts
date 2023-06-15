import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../entities/post.entity';
import { PostMainImage } from '../entities/post-main-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostMainImage])],
  exports: [TypeOrmModule],
})
export class PostsModule {}
