import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannedUsersForBlog } from '../entities/bannedUsersForBlog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BannedUsersForBlog])],
  exports: [TypeOrmModule],
})
export class BannedUsersForBlogModule {}
