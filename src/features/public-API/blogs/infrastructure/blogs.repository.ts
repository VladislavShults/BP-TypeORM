import { Injectable } from '@nestjs/common';
import { BlogDBType } from '../types/blogs.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateBlogDto } from '../api/models/update-blog.dto';
import { Blog } from '../entities/blog.entity';
import { BannedUsersForBlog } from '../../../bloggers-API/users/entities/bannedUsersForBlog.entity';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog) private blogsRepo: Repository<Blog>,
    @InjectRepository(BannedUsersForBlog)
    private bannedUsersForBlogRepo: Repository<BannedUsersForBlog>,
  ) {}

  async deleteBlogById(blogId: string) {
    try {
      await this.blogsRepo
        .createQueryBuilder()
        .update(Blog)
        .set({ isDeleted: true })
        .where('id = :blogId', { blogId })
        .execute();
    } catch (error) {
      return null;
    }
  }

  async removeUserIdFromBannedListBlogs(userId: string, blogId: string) {
    await this.bannedUsersForBlogRepo
      .createQueryBuilder()
      .delete()
      .where('"userId" = :userId AND "blogId" = :blogId', { userId, blogId })
      .execute();
  }

  async updateBlog(blogId: string, updateBlogDTO: UpdateBlogDto) {
    await this.blogsRepo
      .createQueryBuilder()
      .update(Blog)
      .set({
        blogName: updateBlogDTO.name,
        description: updateBlogDTO.description,
        websiteUrl: updateBlogDTO.websiteUrl,
      })
      .where('id = :blogId', { blogId })
      .execute();
  }

  async checkUserInBanListForBlog(
    userId: string,
    blogId: string,
  ): Promise<boolean> {
    const userInBanListForBlog = await this.findUserInBanListForBlog(
      userId,
      blogId,
    );

    if (!userInBanListForBlog) return false;
    else return true;
  }

  async findUserInBanListForBlog(
    userId: string,
    blogId: string,
  ): Promise<BannedUsersForBlog> | null {
    const userInBanListForBlog = await this.bannedUsersForBlogRepo
      .createQueryBuilder()
      .where('"userId" = :userId AND "blogId" = :blogId', { userId, blogId })
      .getOne();

    if (!userInBanListForBlog) return null;
    else return userInBanListForBlog;
  }

  async banOrUnbanBlog(blogId: string, banStatus: boolean, date: Date | null) {
    try {
      await this.blogsRepo
        .createQueryBuilder()
        .update(Blog)
        .set({ isBanned: banStatus, banDate: date })
        .where('id = :blogId', { blogId })
        .execute();
    } catch (error) {
      return null;
    }
  }

  async createBlog(blog: Omit<BlogDBType, 'id'>): Promise<string> {
    const newBlog = await this.blogsRepo.save(blog);
    return newBlog.id;
  }

  async addUserToBanList(ban: Omit<BannedUsersForBlog, 'blog' | 'user'>) {
    await this.bannedUsersForBlogRepo.save(ban);
  }
}
