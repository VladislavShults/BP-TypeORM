import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ViewBlogType } from '../types/blogs.types';
import { BlogsQueryRepository } from './blogs.query.repository';
import { URIParamBlogDto } from './models/URIParam-blog.dto';
import { QueryBlogDto } from './models/query-blog.dto';
import { ViewPostsTypeWithPagination } from '../../posts/types/posts.types';
import { PostsQueryRepository } from '../../posts/api/posts.query.repository';
import { QueryGetPostsByBlogIdDto } from './models/query-getPostsByBlogId.dto';
import { GetUserFromToken } from '../../auth/guards/getUserFromToken.guard';
import { CheckPostsByBlogIdInDB } from '../guards/check-posts-by-blog-id-in-d-b.service';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Get(':blogId')
  async findBlogById(@Param() params: URIParamBlogDto): Promise<ViewBlogType> {
    const blog = await this.blogsQueryRepository.getBlogById(params.blogId);
    if (!blog) throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
    return blog;
  }

  @Get()
  async getBlogs(@Query() query: QueryBlogDto) {
    return await this.blogsQueryRepository.getBlogs(query);
  }

  @Get(':blogId/posts')
  @UseGuards(GetUserFromToken, CheckPostsByBlogIdInDB)
  async getAllPostsByBlogId(
    @Param() params: URIParamBlogDto,
    @Query() query: QueryGetPostsByBlogIdDto,
    @Request() req,
  ): Promise<ViewPostsTypeWithPagination> {
    const userId = req.user?.id.toString() || null;

    return await this.postsQueryRepository.getPostsByBlogId(
      params.blogId,
      query,
      userId,
    );
  }
}
