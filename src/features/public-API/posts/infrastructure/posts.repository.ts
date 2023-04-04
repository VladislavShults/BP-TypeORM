import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UpdatePostByBlogIdDto } from '../../../bloggers-API/blogs/api/models/update-postByBlogId.dto';
import { PostDBType } from '../types/posts.types';
import { Post } from '../entities/post.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Post) private postsRepo: Repository<Post>,
  ) {}

  async deletePostByIdForBlogId(postId: string, blogId: string): Promise<void> {
    try {
      await this.postsRepo
        .createQueryBuilder()
        .update(Post)
        .set({ isDeleted: true })
        .where('id = :postId AND "blogId" = :blogId', { postId, blogId })
        .execute();
    } catch (error) {
      return null;
    }
  }

  async banAndUnbanPostsByBlog(blogId: string, banStatus: boolean) {
    await this.dataSource.query(
      `
    UPDATE public."Posts"
    SET "IsBanned"=$1
    WHERE "BlogId" = $2;`,
      [banStatus, blogId],
    );
  }

  async createPost(post: Omit<PostDBType, 'id'>): Promise<string> {
    const newPost = await this.postsRepo.save(post);
    return newPost.id;
  }

  async updatePost(postId: string, inputModel: UpdatePostByBlogIdDto) {
    try {
      await this.postsRepo
        .createQueryBuilder()
        .update(Post)
        .set({
          title: inputModel.title,
          shortDescription: inputModel.shortDescription,
          content: inputModel.content,
        })
        .where('id = :postId', { postId })
        .execute();
    } catch (error) {
      return null;
    }
  }

  async getBannedUsersForBlogByPostId(
    postId: string,
  ): Promise<{ id: number }[]> {
    let bannedUsers = [];

    try {
      bannedUsers = await this.dataSource.query(
        `
    SELECT bu."UserId" as "id"
    FROM public."BannedUsersForBlog" bu
    JOIN public."Posts" p
    ON bu."BlogId" = p."BlogId"
    WHERE p."PostId" = $1`,
        [postId],
      );
    } catch (error) {}

    return bannedUsers;
  }
}
