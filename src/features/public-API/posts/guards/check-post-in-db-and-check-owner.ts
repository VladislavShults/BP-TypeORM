import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { UserDBType } from '../../../SA-API/users/types/users.types';
import { PostsQueryRepository } from '../api/posts.query.repository';

@Injectable()
export class CheckPostInDBAndBlogOwnerGuard implements CanActivate {
  constructor(private readonly postsQueryRepository: PostsQueryRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const user: UserDBType = request.user as UserDBType;

    const userId = user.id.toString();

    const post = await this.postsQueryRepository.getPostByIdWithUserId(
      request.params.postId,
    );

    if (!post) throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);

    if (userId != post.userId)
      throw new HttpException('User not owner', HttpStatus.FORBIDDEN);

    return true;
  }
}
