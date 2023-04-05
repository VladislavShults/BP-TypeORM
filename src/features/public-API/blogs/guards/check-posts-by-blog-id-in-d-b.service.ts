import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { Post } from '../../posts/entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CheckPostsByBlogIdInDB implements CanActivate {
  constructor(@InjectRepository(Post) private postsRepo: Repository<Post>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const params = request.params;

    let postsArray = [];
    const blogId = params.blogId;

    try {
      postsArray = await this.postsRepo
        .createQueryBuilder()
        .where(
          '"blogId" = :blogId AND "isDeleted" = false AND "isBanned" = false',
          { blogId },
        )
        .getMany();
    } catch (error) {
      postsArray = [];
    }

    if (postsArray.length === 0)
      throw new HttpException('POST NOT FOUND', HttpStatus.NOT_FOUND);
    return true;
  }
}
