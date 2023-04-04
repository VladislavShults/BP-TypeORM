import { Module } from '@nestjs/common';
import { CommentsLikesOrDislikeModule } from './commentsLikesOrDislike.module';

@Module({
  imports: [CommentsLikesOrDislikeModule],
  providers: [],
  controllers: [],
})
export class CommentsLikesOrDislikesHttpModule {}
