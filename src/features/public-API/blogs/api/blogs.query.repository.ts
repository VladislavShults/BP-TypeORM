import { Injectable } from '@nestjs/common';
import {
  BannedUsersForBlogDBType,
  BannedUsersForBlogViewType,
  BlogDBType,
  ViewBannedUsersForBlogWithPaginationType,
  ViewBlogsTypeWithPagination,
  ViewBlogType,
} from '../types/blogs.types';
import { mapBlog } from '../helpers/mapBlogDBToViewModel';
import {
  mapBlogById,
  mapBlogByIdWithUserId,
} from '../helpers/mapBlogByIdToViewModel';
import { QueryBannedUsersDto } from '../../../bloggers-API/users/api/models/query-banned-users.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { QueryBlogDto } from './models/query-blog.dto';
import { Blog } from '../entities/blog.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Blog) private blogsRepo: Repository<Blog>,
  ) {}

  async findBlogById(
    blogId: string,
    isBanned?: boolean,
  ): Promise<ViewBlogType | null> {
    const blogDBType = await this.getBlogByIdDBType(blogId, isBanned);
    if (!blogDBType) return null;
    return mapBlogById(blogDBType);
  }

  async findBlogByIdReturnBlogWithUserId(blogId: string) {
    const blogDBType = await this.getBlogByIdDBType(blogId);
    if (!blogDBType) return null;
    return mapBlogByIdWithUserId(blogDBType);
  }

  async getBlogs(
    query: QueryBlogDto,
    userId?: string,
  ): Promise<ViewBlogsTypeWithPagination> {
    const searchNameTerm: string = query.searchNameTerm || '';
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection = query.sortDirection || 'desc';

    let stringWhere =
      'WHERE b."IsBanned" = false AND b."IsDeleted" = false AND LOWER ("BlogName") LIKE $1';

    const arrayParam = ['%' + searchNameTerm.toLocaleLowerCase() + '%'];

    if (userId) {
      stringWhere =
        'WHERE b."IsBanned" = false AND b."IsDeleted" = false AND LOWER ("BlogName") LIKE $1 AND b."UserId" = $2';
      arrayParam.push(userId);
    }

    const itemsDB: BlogDBType[] = await this.dataSource.query(
      `
    SELECT "BlogId" as "id", "BlogName" as "name", "Description" as "description", "WebsiteUrl" as "websiteUrl",
            b."CreatedAt" as "createdAt", b."IsMembership" as "isMembership"
    FROM public."Blogs" b
    JOIN public. "Users" u
    ON b."UserId" = u."UserId"
    JOIN public. "BanInfo" bi
    ON b."UserId" = bi."UserId"
    ${stringWhere}
    ORDER BY ${'"' + sortBy + '"'} ${sortDirection}
    LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize};`,
      arrayParam,
    );

    const items = itemsDB.map((i) => mapBlog(i));

    const totalCount = await this.dataSource.query(
      `
    SELECT COUNT(*)
    FROM public."Blogs" b
    JOIN public. "Users" u
    ON b."UserId" = u."UserId"
    JOIN public. "BanInfo" bi
    ON b."UserId" = bi."UserId"
    ${stringWhere}`,
      arrayParam,
    );

    return {
      pagesCount: Math.ceil(totalCount[0].count / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount[0].count),
      items,
    };
  }

  async getAllBannedUserForBlog(
    blogId: string,
    query: QueryBannedUsersDto,
  ): Promise<ViewBannedUsersForBlogWithPaginationType> {
    const searchLoginTerm: string = query.searchLoginTerm || '';
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'banDate';
    const sortDirection = query.sortDirection || 'desc';

    let bannedUsersDBType: BannedUsersForBlogDBType[] = [];
    let totalCountArr = [];

    try {
      bannedUsersDBType = await this.dataSource.query(
        `
      SELECT b."UserId" as "userId", u."Login" as "login", b."IsBanned" as "isBanned", "BanDate" as "banDate",
            "BanReason" as "banReason", "BlogId" as "blogId"
      FROM public."BannedUsersForBlog" b
      JOIN public."Users" u
      ON b."UserId" = u."UserId"
      WHERE b."BlogId" = $1
      ORDER BY ${'"' + sortBy + '"'} ${sortDirection}
      LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize};`,
        [blogId],
      );
    } catch (error) {
      bannedUsersDBType = [];
    }

    const items: BannedUsersForBlogViewType[] = bannedUsersDBType.map((b) => ({
      id: b.userId.toString(),
      login: b.login,
      banInfo: {
        isBanned: b.isBanned,
        banDate: b.banDate,
        banReason: b.banReason,
      },
    }));

    try {
      totalCountArr = await this.dataSource.query(
        `
    SELECT count(*)
      FROM public."BannedUsersForBlog" b
      JOIN public."Users" u
      ON b."UserId" = u."UserId"
      WHERE b."BlogId" = $1 AND LOWER ("Login") LIKE $2`,
        [blogId, '%' + searchLoginTerm.toLocaleLowerCase() + '%'],
      );
    } catch (error) {
      totalCountArr[0].count = 0;
    }

    return {
      pagesCount: Math.ceil(totalCountArr[0].count / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCountArr[0].count),
      items,
    };
  }

  private async getBlogByIdDBType(blogId: string, isBanned?: boolean) {
    let stringWhere =
      'id = :blogId AND "isDeleted" = false AND "isBanned" = false;';
    if (isBanned) {
      stringWhere = 'id = :blogId AND "isDeleted" = false;';
    }

    try {
      //   const blog = await this.dataSource.query(
      //     `
      // SELECT "BlogId" as "id", "BlogName" as "name", "Description" as "description", "IsMembership" as "isMembership",
      //         "WebsiteUrl" as "websiteUrl", "CreatedAt" as "createdAt", "UserId" as "userId", "IsBanned" as "isBanned"
      // FROM public."Blogs"
      // ${stringWhere}`,
      //     [blogId],
      //   );
      return this.blogsRepo
        .createQueryBuilder()
        .where(stringWhere, { blogId })
        .getOne();
    } catch (error) {
      return null;
    }
  }

  async getBanAndUnbanBlogById(blogId: string) {
    return await this.getBlogByIdDBType(blogId, true);
  }
}
