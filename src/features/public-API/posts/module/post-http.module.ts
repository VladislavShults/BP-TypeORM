import { Module } from '@nestjs/common';
import { PostsModule } from './post.module';

@Module({
  imports: [PostsModule],
  providers: [],
  controllers: [],
})
export class PostHttpModule {}
