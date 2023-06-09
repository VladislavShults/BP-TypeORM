import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { URIParamBlogDto } from '../../../public-API/blogs/api/models/URIParam-blog.dto';
import { JwtAuthGuard } from '../../../public-API/auth/guards/JWT-auth.guard';
import { CheckBlogInDBAndBlogOwnerGuard } from '../guards/checkBlogOwner.guard';
import { UpdateBlogDto } from '../../../public-API/blogs/api/models/update-blog.dto';
import { CreateBlogDto } from '../../../public-API/blogs/api/models/create-blog.dto';
import { ViewBlogType } from '../../../public-API/blogs/types/blogs.types';
import { UserDBType } from '../../../SA-API/users/types/users.types';
import { QueryBlogDto } from '../../../public-API/blogs/api/models/query-blog.dto';
import { CreatePostBySpecificBlogDto } from '../../../public-API/blogs/api/models/create-postBySpecificBlog.dto';
import { ViewPostType } from '../../../public-API/posts/types/posts.types';
import { PostsService } from '../../../public-API/posts/application/posts.service';
import { PostsQueryRepository } from '../../../public-API/posts/api/posts.query.repository';
import { URIParamsUpdateDto } from './models/URI-params-update.dto';
import { UpdatePostByBlogIdDto } from './models/update-postByBlogId.dto';
import { CheckPostInDBGuard } from '../../../public-API/posts/guards/check-post-in-DB.post';
import { URIParamsDeleteDto } from './models/URI-params-delete.dto';
import { BlogsService } from '../../../public-API/blogs/application/blogs.service';
import { CommentsQueryRepository } from '../../../public-API/comments/api/comments.query.repository';
import { ViewAllCommentsForAllPostsWithPaginationType } from '../../../public-API/comments/types/comments.types';
import { QueryCommentDto } from '../../../public-API/comments/api/models/query-comment.dto';
import { BlogsQueryRepository } from '../../../public-API/blogs/api/blogs.query.repository';
import { S3Adapter } from '../../../public-API/upload/application/s3-adapter';
import { CommandBus } from '@nestjs/cqrs';
import { UploadWallpaperImageAndSaveInfoInDbCommand } from '../../../public-API/blogs/application/use-cases/upload - wallpaper-and-save-info-in-db.usecase';
import { UploadMainImageAndSaveInfoInDbCommand } from '../../../public-API/blogs/application/use-cases/upload-main-image-and-save-in-db.usecase';
import { CheckPostInDBAndBlogOwnerGuard } from '../../../public-API/posts/guards/check-post-in-db-and-check-owner';
import { UploadPostMainImageAndSaveInfoInDbCommand } from '../../../public-API/posts/application/use-cases/upload-post-main-image-and-save-in-db';

@Controller('blogger/blogs')
export class BloggersBlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly uploadService: S3Adapter,
    private readonly commandCommandBus: CommandBus,
  ) {}
  @Delete(':blogId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, CheckBlogInDBAndBlogOwnerGuard)
  async deleteBlogById(@Param() params: URIParamBlogDto): Promise<HttpStatus> {
    await this.blogsService.deleteBlogById(params.blogId);
    return;
  }

  @Put(':blogId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, CheckBlogInDBAndBlogOwnerGuard)
  async updateBlog(
    @Param() params: URIParamBlogDto,
    @Body() updateBlogDTO: UpdateBlogDto,
  ): Promise<HttpStatus> {
    await this.blogsService.updateBlogById(params.blogId, updateBlogDTO);
    return;
  }

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  async createBlog(
    @Body() createBlogDTO: CreateBlogDto,
    @Request() req,
  ): Promise<ViewBlogType> {
    const user: UserDBType = req.user;

    const newBlogId = await this.blogsService.createBlog(createBlogDTO, user);
    return await this.blogsQueryRepository.getBlogById(newBlogId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getBlogs(@Query() query: QueryBlogDto, @Request() req) {
    const userId: string = req.user.id.toString();
    return await this.blogsQueryRepository.getBlogs(query, userId);
  }

  @Post(':blogId/posts')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, CheckBlogInDBAndBlogOwnerGuard)
  async createPostForSpecificBlog(
    @Param() params: URIParamBlogDto,
    @Body() inputModel: CreatePostBySpecificBlogDto,
    @Request() req,
  ): Promise<ViewPostType> {
    const userId: string = req.user.id;

    const newPostId = await this.postsService.createPost(
      params.blogId,
      inputModel,
      userId,
    );

    return await this.postsQueryRepository.getPostById(newPostId);
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, CheckBlogInDBAndBlogOwnerGuard, CheckPostInDBGuard)
  async updatePost(
    @Param() params: URIParamsUpdateDto,
    @Body() inputModel: UpdatePostByBlogIdDto,
  ): Promise<HttpStatus> {
    await this.postsService.updatePost(params.postId, inputModel);
    return;
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, CheckBlogInDBAndBlogOwnerGuard, CheckPostInDBGuard)
  async deletePostById(
    @Param() params: URIParamsDeleteDto,
  ): Promise<HttpStatus> {
    await this.postsService.deletePostByIdForBlogId(
      params.postId,
      params.blogId,
    );
    return;
  }

  @Get('comments')
  @UseGuards(JwtAuthGuard)
  async getAllCommentsForAllPostsCurrentUser(
    @Query() query: QueryCommentDto,
    @Request() req,
  ): Promise<ViewAllCommentsForAllPostsWithPaginationType> {
    const userId: string = req.user.id.toString();
    return await this.commentsQueryRepository.getAllCommentsForAllPostsCurrentUser(
      query,
      userId,
    );
  }

  @Post(':blogId/images/wallpaper')
  @UseGuards(JwtAuthGuard, CheckBlogInDBAndBlogOwnerGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadWallpaperFile(
    @Request() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const blogId: string = req.params.blogId;

    await this.commandCommandBus.execute(
      new UploadWallpaperImageAndSaveInfoInDbCommand(
        file.originalname,
        file.buffer,
        blogId,
      ),
    );

    return this.blogsQueryRepository.getWallpaperAndMainImageForBlog(blogId);
  }

  @Post(':blogId/images/main')
  @UseGuards(JwtAuthGuard, CheckBlogInDBAndBlogOwnerGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadMainImageFile(
    @Request() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const blogId: string = req.params.blogId;

    await this.commandCommandBus.execute(
      new UploadMainImageAndSaveInfoInDbCommand(
        file.originalname,
        file.buffer,
        blogId,
      ),
    );

    return this.blogsQueryRepository.getWallpaperAndMainImageForBlog(blogId);
  }

  @Post(':blogId/posts/:postId/images/main')
  @UseGuards(JwtAuthGuard, CheckPostInDBAndBlogOwnerGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPostMainImageFile(
    @Request() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const postId = Number(req.params.postId);

    await this.commandCommandBus.execute(
      new UploadPostMainImageAndSaveInfoInDbCommand(
        file.originalname,
        file.buffer,
        postId,
      ),
    );

    return this.postsQueryRepository.getMainImageForPost(postId);
  }
}
