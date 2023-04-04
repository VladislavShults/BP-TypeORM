import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsLikesOrDislike } from '../entities/postsLikesOrDislike.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostsLikesOrDislike])],
  exports: [TypeOrmModule],
})
export class PostsLikesOrDislikeModule {}
