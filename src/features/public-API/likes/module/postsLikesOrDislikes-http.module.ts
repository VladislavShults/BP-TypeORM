import { Module } from '@nestjs/common';
import { PostsLikesOrDislikeModule } from './postsLikesOrDislike.module';

@Module({
  imports: [PostsLikesOrDislikeModule],
  providers: [],
  controllers: [],
})
export class PostsLikesOrDislikesHttpModule {}
