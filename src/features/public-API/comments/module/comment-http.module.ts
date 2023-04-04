import { Module } from '@nestjs/common';
import { CommentsModule } from './comment.module';

@Module({
  imports: [CommentsModule],
  providers: [],
  controllers: [],
})
export class CommentHttpModule {}
