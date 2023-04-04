import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { Post } from '../entities/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CheckPostInDBGuard implements CanActivate {
  constructor(@InjectRepository(Post) private postsRepo: Repository<Post>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const postId = request.params.postId;

    let post: Post;

    try {
      post = await this.postsRepo
        .createQueryBuilder()
        .where('id = :postId AND "isDeleted" = false AND "isBanned" = false', {
          postId,
        })
        .getOne();
    } catch (error) {
      throw new HttpException('POST NOT FOUND', HttpStatus.NOT_FOUND);
    }

    if (!post) throw new HttpException('POST NOT FOUND', HttpStatus.NOT_FOUND);
    return true;
  }
}
