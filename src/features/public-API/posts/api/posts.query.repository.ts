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
import { PostMainImage } from '../entities/post-main-image.entity';
import { mapPostMainImageDbToView } from '../helpers/map-post-main-image-db-to-view';

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
    SELECT p."id" as "id", p."title", p."shortDescription", p."newestLikes", 
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
    let { sortBy } = query;
    const { sortDirection, pageSize, pageNumber } = query;

    if (sortBy === 'name') sortBy = 'blogName';

    const queryBuilder = this.dataSource
      .getRepository(Post)
      .createQueryBuilder('p')
      .select([
        'p.id as "id"',
        'p.title as "title"',
        'p.shortDescription as "shortDescription"',
        'p.content as "content"',
        'p.createdAt as "createdAt"',
        'p.blogId as "blogId"',
        'p.newestLikes as "newestLikes"',
        'b.blogName as "blogName"',
        'm.url as "url"',
        'm.height as "height"',
        'm.width as "width"',
        'm.fileSize as "fileSize"',
        `COUNT(likes.id) AS "likesCount"`,
        `COUNT(dislikes.id) AS "dislikesCount"`,
      ])
      .leftJoin('p.blog', 'b')
      .leftJoin('p.main', 'm')
      .leftJoin('p.postLikeOrDislike', 'likes', 'likes.status = :like')
      .leftJoin('p.postLikeOrDislike', 'dislikes', 'dislikes.status = :dislike')
      .where('p.isDeleted = :isDeleted')
      .andWhere('p.blogId = :blogId')
      .groupBy('p.id, b.id, m.id')
      .setParameters({
        blogId,
        isDeleted: false,
        like: 'Like',
        dislike: 'Dislike',
      })
      .orderBy(`p.${sortBy}`, sortDirection)
      .skip((pageNumber - 1) * pageSize)
      .take(pageSize);

    if (userId) {
      queryBuilder
        .addSelect(`my.status AS "myStatus"`)
        .leftJoin('p.postLikeOrDislike', 'my', 'my."userId" = :userId')
        .groupBy('p.id, b.id, m.id, my.status')
        .setParameter('userId', userId);
    }

    const itemsDBType = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();

    const items = itemsDBType.map((i) => mapPost(i));

    const totalCount = Number(count);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount,
      items,
    };
  }

  async getPostByIdWithUserId(postId: string): Promise<Post> {
    const post = await this.dataSource
      .getRepository(Post)
      .find({ where: { id: postId } });

    return post[0];
  }

  async getMainImageForPost(postId: number) {
    const postInfo = await this.dataSource
      .getRepository(PostMainImage)
      .find({ where: { postId: postId } });

    const result = mapPostMainImageDbToView(postInfo[0]);

    return result;
  }
}
