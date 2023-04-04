import { Injectable } from '@nestjs/common';
import {
  BannedUsersForBlogDBType,
  BannedUsersForBlogViewType,
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
    let sortDirection: 'ASC' | 'DESC' = 'DESC';
    if (query.sortDirection)
      sortDirection = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';

    let stringWhere =
      '"isBanned" = false AND "isDeleted" = false AND LOWER("blogName") like :searchName';

    let params: { searchName: string; userId?: string } = {
      searchName: '%' + searchNameTerm.toLocaleLowerCase() + '%',
    };

    if (userId) {
      stringWhere =
        '"isBanned" = false AND "isDeleted" = false AND LOWER("blogName") like :searchName AND "userId" = :userId';
      params = {
        searchName: '%' + searchNameTerm.toLocaleLowerCase() + '%',
        userId,
      };
    }

    const itemsDB = await this.blogsRepo
      .createQueryBuilder('b')
      .where(stringWhere, params)
      .limit(pageSize)
      .orderBy('"' + sortBy + '"', sortDirection)
      .offset((pageNumber - 1) * pageSize)
      .getManyAndCount();

    const items = itemsDB[0].map((i) => mapBlog(i));

    const totalCount = itemsDB[1];

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount),
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
      'id = :blogId AND "isDeleted" = false AND "isBanned" = false';
    if (isBanned) {
      stringWhere = 'id = :blogId AND "isDeleted" = false';
    }
    try {
      const blog = await this.blogsRepo
        .createQueryBuilder()
        .where(stringWhere, { blogId })
        .getOne();

      return blog;
    } catch (error) {
      return null;
    }
  }

  async getBanAndUnbanBlogById(blogId: string) {
    return await this.getBlogByIdDBType(blogId, true);
  }
}
