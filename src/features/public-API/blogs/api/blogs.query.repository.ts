import { Injectable } from '@nestjs/common';
import {
  BannedUsersForBlogViewType,
  ViewBannedUsersForBlogWithPaginationType,
  ViewBlogsTypeWithPagination,
  ViewBlogType,
  WallpaperAndMainViewType,
} from '../types/blogs.types';
import {
  mapBlogById,
  mapBlogByIdWithUserId,
} from '../helpers/mapBlogByIdToViewModel';
import { QueryBannedUsersDto } from '../../../bloggers-API/users/api/models/query-banned-users.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { QueryBlogDto } from './models/query-blog.dto';
import { Blog } from '../entities/blog.entity';
import { BannedUsersForBlog } from '../../../bloggers-API/users/entities/bannedUsersForBlog.entity';
import { mapBlogWithWallpaperAndMainToWallpaperAndMain } from '../helpers/mapBlogWithWallpaperAndMainToWallaperAndMain';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Blog) private blogsRepo: Repository<Blog>,
    @InjectRepository(BannedUsersForBlog)
    private bannedUsersForBlogRepo: Repository<BannedUsersForBlog>,
  ) {}

  async getBlogById(
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
    let { sortBy } = query;
    const { searchNameTerm, sortDirection, pageSize, pageNumber } = query;

    if (sortBy === 'name') sortBy = 'blogName';

    let stringWhere =
      'b."isBanned" = false AND b."isDeleted" = false AND LOWER(b."blogName") like :searchName';

    let params: { searchName: string; userId?: string } = {
      searchName: '%' + searchNameTerm.toLocaleLowerCase() + '%',
    };

    if (userId) {
      stringWhere =
        'b."isBanned" = false AND b."isDeleted" = false AND LOWER(b."blogName") like :searchName AND b."userId" = :userId';
      params = {
        searchName: '%' + searchNameTerm.toLocaleLowerCase() + '%',
        userId,
      };
    }

    const itemsDB = await this.blogsRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.wallpapers', 'wallpaper')
      .leftJoinAndSelect('b.main', 'main')
      .where(stringWhere, params)
      .limit(pageSize)
      .orderBy('b."' + sortBy + '"', sortDirection)
      .offset((pageNumber - 1) * pageSize)
      .getManyAndCount();

    const items = itemsDB[0].map((i) => mapBlogById(i));

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
    let sortDirection: 'ASC' | 'DESC' = 'DESC';
    if (query.sortDirection)
      sortDirection = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';

    let bannedUsers: (BannedUsersForBlog & { login: string })[] = [];
    let totalCount = 0;
    const loginTerm = '%' + searchLoginTerm.toLocaleLowerCase() + '%';

    try {
      bannedUsers = await this.bannedUsersForBlogRepo
        .createQueryBuilder('bu')
        .innerJoinAndSelect('bu.user', 'u')
        .select([
          'bu."userId"',
          'u.login as login',
          'bu."isBanned"',
          'bu."banDate"',
          'bu."banReason"',
          'bu."blogId"',
        ])
        .where('bu."blogId" = :blogId AND LOWER(u.login) like :loginTerm', {
          blogId,
          loginTerm,
        })
        .limit(pageSize)
        .orderBy('"' + sortBy + '"', sortDirection)
        .offset((pageNumber - 1) * pageSize)
        .getRawMany();
    } catch (error) {
      bannedUsers = [];
    }

    const items: BannedUsersForBlogViewType[] = bannedUsers.map((b) => ({
      id: b.userId.toString(),
      login: b.login,
      banInfo: {
        isBanned: b.isBanned,
        banDate: b.banDate,
        banReason: b.banReason,
      },
    }));

    try {
      totalCount = await this.bannedUsersForBlogRepo
        .createQueryBuilder('bu')
        .innerJoinAndSelect('bu.user', 'u')
        .where('bu."blogId" = :blogId AND LOWER(u.login) like :loginTerm', {
          blogId,
          loginTerm,
        })
        .getCount();
    } catch (error) {}

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount),
      items,
    };
  }

  private async getBlogByIdDBType(blogId: string, isBanned?: boolean) {
    let stringWhere =
      'b.id = :blogId AND b."isDeleted" = false AND b."isBanned" = false';
    if (isBanned) {
      stringWhere = 'b.id = :blogId AND b."isDeleted" = false';
    }
    try {
      const blog = await this.blogsRepo
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.wallpapers', 'wallpaper')
        .leftJoinAndSelect('b.main', 'main')
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

  async getWallpaperAndMainImageForBlog(
    blogId: string,
  ): Promise<WallpaperAndMainViewType> {
    const wallpapersAndMainImageDb = await this.getBlogByIdDBType(blogId);

    return mapBlogWithWallpaperAndMainToWallpaperAndMain(
      wallpapersAndMainImageDb,
    );
  }
}
