import { Injectable } from '@nestjs/common';
import {
  ViewPostsTypeWithPagination,
  ViewPostType,
} from '../types/posts.types';
import { mapPost } from '../helpers/mapPostDBToViewModel';
import { QueryGetPostsByBlogIdDto } from '../../blogs/api/models/query-getPostsByBlogId.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Post } from '../entities/post.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Post) private postsRepo: Repository<Post>,
  ) {}

  async getPostById(
    postId: string,
    userId?: string,
  ): Promise<ViewPostType | null> {
    let postDBType = [];

    let stringWhere = '';
    let params: string[] = [postId];

    if (userId) {
      stringWhere =
        ', (SELECT "status" as "myStatus" FROM public."posts_likes_or_dislike" pl WHERE pl."postId" = p."id" AND pl."userId" = $2) as "myStatus"';
      params = [postId, userId];
    }

    try {
      postDBType = await this.postsRepo.query(
        `
    SELECT p."id", p."title", p."shortDescription", p."newestLikes", 
           p."content", p."blogId", b."blogName", p."createdAt", 
        (SELECT COUNT(*)
           FROM public."posts_likes_or_dislike" pl
           JOIN public."ban_info" b
           ON pl."userId" = b."userId"
           WHERE pl."status" = 'Like' AND pl."postId" = p."id" AND b."isBanned" = false) as "likesCount",
        (SELECT COUNT(*)
           FROM public."posts_likes_or_dislike" pl
           JOIN public."ban_info" b
           ON pl."userId" = b."userId"
           WHERE pl."status" = 'Dislike' AND pl."postId" = p."id" AND b."isBanned" = false) as "dislikesCount"
           ${stringWhere}
    FROM public."post" p
    JOIN public."blog" b
    ON p."blogId" = b."id"
    WHERE p."isDeleted" = false AND p."isBanned" = false
    AND p."id" = $1`,
        params,
      );
    } catch (error) {
      postDBType = [];
    }

    if (postDBType.length === 0) return null;

    const post = mapPost(postDBType[0]);

    return post;
  }

  async getPosts(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: 'ASC' | 'DESC',
    userId: string,
  ): Promise<ViewPostsTypeWithPagination> {
    let stringWhere = '';
    let params = [];

    if (userId) {
      stringWhere =
        ', (SELECT "status" as "myStatus" FROM public."posts_likes_or_dislike" pl WHERE pl."postId" = p."id" AND pl."userId" = $1) as "myStatus"';
      params = [userId];
    }
    const itemsDBType = await this.dataSource.query(
      `
    SELECT p."id" as "id", "title", "shortDescription", p."newestLikes" as "newestLikes",
            "content", p."blogId" as "blogId", b."blogName" as "blogName", p."createdAt" as "createdAt",
        (SELECT COUNT(*)
           FROM public."posts_likes_or_dislike" pl
           WHERE pl."status" = 'Like' AND pl."postId" = p."id") as "likesCount",
        (SELECT COUNT(*)
           FROM public."posts_likes_or_dislike" pl
           WHERE pl."status" = 'Dislike' AND pl."postId" = p."id") as "dislikesCount"
           ${stringWhere}
    FROM public."post" p
    JOIN public. "blog" b
    ON p."blogId" = b."id"
    ORDER BY ${'"' + sortBy + '"'} ${sortDirection}
    LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize}`,
      params,
    );

    const totalCount = await this.dataSource.query(`
    SELECT count(*)
    FROM public."post"`);

    const items = itemsDBType.map((i) => mapPost(i));

    return {
      pagesCount: Math.ceil(totalCount[0].count / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount[0].count),
      items,
    };
  }

  async getPostsByBlogId(
    blogId: string,
    query: QueryGetPostsByBlogIdDto,
    userId: string,
  ): Promise<ViewPostsTypeWithPagination | null> {
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    let sortBy: string = query.sortBy || 'createdAt';
    if (sortBy === 'name') sortBy = 'blogName';
    let sortDirection: 'ASC' | 'DESC' = 'DESC';
    if (query.sortDirection)
      sortDirection = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';

    let stringWhere = '';
    let params = [blogId];

    if (userId) {
      stringWhere =
        ', (SELECT "status" as "myStatus" FROM public."posts_likes_or_dislike" pl WHERE pl."postId" = p."id" AND pl."userId" = $2) as "myStatus"';
      params = [blogId, userId];
    }
    const itemsDBType = await this.dataSource.query(
      `
    SELECT "id", "title", "shortDescription", p."newestLikes" as "newestLikes",
            "content", p."blogId" as "blogId", b."blogName" as "blogName", p."createdAt" as "createdAt",
        (SELECT COUNT(*)
           FROM public."posts_likes_or_dislike" pl
           WHERE pl."status" = 'Like' AND pl."postId" = p."id" AND p."blogId" = $1) as "likesCount",
        (SELECT COUNT(*)
           FROM public."posts_likes_or_dislike" pl
           WHERE pl."status" = 'Dislike' AND pl."postId" = p."id" AND p."blogId" = $1) as "dislikesCount"
           ${stringWhere}
    FROM public."post" p
    JOIN public. "blog" b
    ON p."blogId" = b."id"
    WHERE p."isDeleted" = false AND p."blogId" = $1
    ORDER BY ${'"' + sortBy + '"'} ${sortDirection}
    LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize}`,
      params,
    );

    const totalCount = await this.dataSource.query(
      `
    SELECT count(*)
    FROM public."post"
    WHERE "blogId" = $1 AND "isDeleted" = false`,
      [params[0]],
    );

    const items = itemsDBType.map((i) => mapPost(i));

    return {
      pagesCount: Math.ceil(totalCount[0].count / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount[0].count),
      items,
    };
  }
}
