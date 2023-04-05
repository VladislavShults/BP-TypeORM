import { Injectable } from '@nestjs/common';
import { QueryBlogDto } from '../../../public-API/blogs/api/models/query-blog.dto';
import { BlogDBType } from '../../../public-API/blogs/types/blogs.types';
import { ViewBlogsTypeWithUserOwnerPagination } from '../types/admin.blogs.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { mapBlogUserOwner } from '../helpers/mapBlogUserOwner';

@Injectable()
export class AdminBlogsQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getBlogs(
    query: QueryBlogDto,
  ): Promise<ViewBlogsTypeWithUserOwnerPagination> {
    const searchNameTerm: string = query.searchNameTerm || '';
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection = query.sortDirection || 'desc';

    const itemsDB: [BlogDBType & { login: string }] =
      await this.dataSource.query(
        `
    SELECT b."id", "blogName" as "name", "description", "websiteUrl",
            b."createdAt" as "createdAt", b."isMembership" as "isMembership", u."id" as "userId", u."login" as "userLogin", 
            b."isBanned" as "isBanned", b."banDate" as "banDate"
    FROM public."blog" b
    JOIN public. "user" u
    ON b."userId" = u."id"
    JOIN public. "ban_info" bi
    ON bi."userId" = b."userId"
    WHERE b."isDeleted" = false AND bi."isBanned" = false AND LOWER ("blogName") LIKE $1
    ORDER BY ${'"' + sortBy + '"'} ${sortDirection}
    LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize};`,
        ['%' + searchNameTerm.toLocaleLowerCase() + '%'],
      );

    const items = itemsDB.map((i) => mapBlogUserOwner(i));

    const totalCount = await this.dataSource.query(
      `
    SELECT COUNT(*)
    FROM public."blog" b
    JOIN public. "user" u
    ON b."userId" = u."id"
    JOIN public. "ban_info" bi
    ON b."userId" = bi."userId"
    WHERE b."isDeleted" = false AND LOWER ("blogName") LIKE $1`,
      ['%' + searchNameTerm.toLocaleLowerCase() + '%'],
    );

    return {
      pagesCount: Math.ceil(totalCount[0].count / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount[0].count),
      items,
    };
  }
}
