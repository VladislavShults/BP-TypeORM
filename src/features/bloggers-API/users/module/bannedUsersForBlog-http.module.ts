import { Module } from '@nestjs/common';
import { BannedUsersForBlogModule } from './bannedUsersForBlog.module';

@Module({
  imports: [BannedUsersForBlogModule],
  providers: [],
  controllers: [],
})
export class BannedUsersForBlogHttpModule {}
