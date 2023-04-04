import { Injectable } from '@nestjs/common';
import {
  ViewAllCommentsForAllPostsWithPaginationType,
  ViewCommentsTypeWithPagination,
  ViewCommentType,
} from '../types/comments.types';
import { mapComment } from '../helpers/mapCommentDBTypeToViewModel';
import { QueryPostDto } from '../../posts/api/models/query-post.dto';
import { mapCommentDBTypeToAllCommentForAllPosts } from '../helpers/mapCommentDBTypeToAllCommentForAllPosts';
import { QueryCommentDto } from './models/query-comment.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BannedUsersForBlog } from '../../../bloggers-API/users/entities/bannedUsersForBlog.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(BannedUsersForBlog)
    private bannedUsersForBlogRepo: Repository<BannedUsersForBlog>,
  ) {}

  async getCommentById(
    commentId: string,
    userId?: string,
  ): Promise<ViewCommentType | null> {
    let stringWhere = '';
    let params: string[] = [commentId];

    if (userId) {
      stringWhere =
        ', (SELECT "Status" as "myStatus" FROM public."CommentsLikesOrDislike" c WHERE "CommentId" = $1 AND "UserId" = $2) as "myStatus"';
      params = [commentId, userId];
    }

    let commentDBType = [];

    try {
      commentDBType = await this.dataSource.query(
        `
    SELECT c."CommentId" as "id", c."Content" as "content", c."UserId" as "userId", u."Login" as "userLogin", 
           c."CreatedAt" as "createdAt", 
        (SELECT COUNT(*)
        FROM public."CommentsLikesOrDislike" c
        JOIN public."BanInfo" b
        ON c."UserId" = b."UserId"
        WHERE c."Status" = 'Like' AND c."CommentId" = $1 AND b."IsBanned" = false) as "likesCount",
        (SELECT COUNT(*)
        FROM public."CommentsLikesOrDislike"
        JOIN public."BanInfo" b
        ON c."UserId" = b."UserId"
        WHERE "Status" = 'Dislike' AND "CommentId" = $1 AND b."IsBanned" = false) as "dislikesCount"
        ${stringWhere}
    FROM public."Comments" c
    JOIN public."Users" u
    ON c."UserId" = u."UserId"
    WHERE c."IsBanned" = false AND c."IsDeleted" = false AND c."CommentId" = $1`,
        params,
      );
    } catch (error) {}

    if (commentDBType.length === 0) return null;

    return mapComment(commentDBType[0]);
  }

  async getCommentsByPostId(
    postId: string,
    query: QueryPostDto,
    userId?: string,
  ): Promise<ViewCommentsTypeWithPagination> {
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    let stringWhere = '';
    let params: string[] = [postId];

    if (userId) {
      stringWhere =
        ', (SELECT "Status" as "myStatus" FROM public."CommentsLikesOrDislike" cl WHERE cl."CommentId" = c."CommentId" AND "UserId" = $2) as "myStatus"';
      params = [postId, userId];
    }

    let commentDBType = [];

    try {
      commentDBType = await this.dataSource.query(
        `
    SELECT c."CommentId" as "id", c."Content" as "content", c."UserId" as "userId", u."Login" as "userLogin", 
           c."CreatedAt" as "createdAt", 
        (SELECT COUNT(*)
        FROM public."CommentsLikesOrDislike" cl
        WHERE "Status" = 'Like' AND cl."CommentId" = c."CommentId") as "likesCount",
        (SELECT COUNT(*)
        FROM public."CommentsLikesOrDislike" cl
        WHERE "Status" = 'Dislike' AND cl."CommentId" = c."CommentId") as "dislikesCount"
        ${stringWhere}
    FROM public."Comments" c
    JOIN public."Users" u
    ON c."UserId" = u."UserId"
    WHERE c."IsBanned" = false AND c."IsDeleted" = false AND c."PostId" = $1
    ORDER BY ${'"' + sortBy + '"'} ${sortDirection}
    LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize}`,
        params,
      );
    } catch (error) {}

    if (commentDBType.length === 0) return null;

    const items = commentDBType.map((i) => mapComment(i));

    const totalCount = await this.dataSource.query(
      `
    SELECT count(*)
    FROM public."Comments" c
    JOIN public."Users" u
    ON c."UserId" = u."UserId"
    WHERE c."IsBanned" = false AND c."IsDeleted" = false AND c."PostId" = $1`,
      [params[0]],
    );

    return {
      pagesCount: Math.ceil(Number(totalCount[0].count) / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount[0].count),
      items,
    };
  }

  async getAllCommentsForAllPostsCurrentUser(
    query: QueryCommentDto,
    userId: string,
  ): Promise<ViewAllCommentsForAllPostsWithPaginationType> {
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    let sortDirection: 'ASC' | 'DESC' = 'DESC';
    if (query.sortDirection)
      sortDirection = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';

    const idsBannedUsersForBlogsThisUser =
      //   await this.dataSource.query(
      //     `
      // SELECT bu."UserId" as "id"
      // FROM public."BannedUsersForBlog" bu
      // JOIN public."Blogs" b
      // ON bu."BlogId" = b."BlogId"
      // WHERE b."UserId" = $1`,
      //     [userId],
      //   );
      await this.bannedUsersForBlogRepo
        .createQueryBuilder('bu')
        .leftJoin('bu.blog', 'b')
        .select(['bu."userId"'])
        .where('b."userId" = :userId', { userId })
        .getMany();

    const bannedIdsArray = idsBannedUsersForBlogsThisUser.map((i) => {
      return i.userId;
    });

    const bannedIds = bannedIdsArray.join();

    let stringNotIn = '';

    let params = [userId];

    if (bannedIdsArray.length !== 0) {
      stringNotIn = 'AND c."userId" NOT IN ($2)';
      params = [userId, bannedIds];
    }

    const itemsDBType = await this.dataSource.query(
      `
    SELECT c."id", c."content", c."userId", u."login" as "userLogin",
           c."createdAt", c."postId", p."title", p."blogId",
           b."blogName",
           (SELECT COUNT(*)
                 FROM public."comments_likes_or_dislike" cl
                 WHERE "status" = 'Like' AND cl."commentId" = c."id") as "likesCount",
           (SELECT COUNT(*)
                 FROM public."comments_likes_or_dislike" cl
                 WHERE "status" = 'Dislike' AND cl."commentId" = c."id") as "dislikesCount",
           (SELECT "status" as "myStatus" 
                 FROM public."comments_likes_or_dislike" cl 
                 WHERE cl."commentId" = c."id" 
                 AND "userId" = $1) as "myStatus"
    FROM public."comment" c
    JOIN public."user" u
    ON c."userId" = u."id"
    JOIN public."post" p
    ON c."postId" = p."id"
    JOIN public."blog" b
    ON p."blogId" = b."id"
    WHERE c."isBanned" = false AND c."isDeleted" = false AND b."userId" = $1
    ${stringNotIn}
    ORDER BY ${'"' + sortBy + '"'} ${sortDirection}
    LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize}`,
      params,
    );

    if (itemsDBType.length === 0) return null;

    const items = itemsDBType.map((i) =>
      mapCommentDBTypeToAllCommentForAllPosts(i),
    );

    const totalCount = await this.dataSource.query(
      `
    SELECT COUNT(*)
    FROM public."comment" c
    JOIN public."user" u
    ON c."userId" = u."id"
    JOIN public."post" p
    ON c."postId" = p."id"
    JOIN public."blog" b
    ON p."blogId" = b."id"
    WHERE c."isBanned" = false AND c."isDeleted" = false AND b."userId" = $1
    ${stringNotIn}`,
      params,
    );

    return {
      pagesCount: Math.ceil(Number(totalCount[0].count) / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: Number(totalCount[0].count),
      items,
    };
  }
}
