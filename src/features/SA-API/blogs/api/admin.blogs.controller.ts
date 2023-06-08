import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../../public-API/auth/guards/basic-auth.guard';
import { UsersService } from '../../users/application/users.servive';
import { BlogsService } from '../../../public-API/blogs/application/blogs.service';
import { QueryBlogDto } from '../../../public-API/blogs/api/models/query-blog.dto';
import { AdminBlogsQueryRepository } from './admin.blogs.query.repository';
import { URIParamBlogDto } from '../../../public-API/blogs/api/models/URIParam-blog.dto';
import { BanBlogDto } from './models/ban-blog.dto';
import { BlogsQueryRepository } from '../../../public-API/blogs/api/blogs.query.repository';
import { PostsService } from '../../../public-API/posts/application/posts.service';

@Controller('sa/blogs')
export class AdminBlogsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly adminBlogQueryRepository: AdminBlogsQueryRepository,
    private readonly blogQueryRepository: BlogsQueryRepository,
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  async getBlogs(@Query() query: QueryBlogDto) {
    return await this.adminBlogQueryRepository.getBlogs(query);
  }

  @Put(':blogId/ban')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  async banAndUnbanBlog(
    @Param() params: URIParamBlogDto,
    @Body() inputModel: BanBlogDto,
  ) {
    const blog = await this.blogQueryRepository.getBlogById(
      params.blogId,
      true,
    );
    if (!blog) throw new HttpException('blog not found', HttpStatus.NOT_FOUND);

    await this.blogsService.banOrUnbanBlog(params.blogId, inputModel.isBanned);

    await this.postsService.banOrUnbanPostsByBlog(
      params.blogId,
      inputModel.isBanned,
    );

    return;
  }
}
