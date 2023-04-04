import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsLikesOrDislike } from '../entities/commentsLikesOrDislike';

@Module({
  imports: [TypeOrmModule.forFeature([CommentsLikesOrDislike])],
  exports: [TypeOrmModule],
})
export class CommentsLikesOrDislikeModule {}
