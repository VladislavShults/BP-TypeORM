import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comment } from '../entities/comment.entity';

@Injectable()
export class CheckCommentInDB implements CanActivate {
  constructor(
    @InjectRepository(Comment)
    private commentsRepo: Repository<Comment>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const params = request.params;

    let comment: Comment;
    const commentId = params.commentId;

    try {
      //   commentArray = await this.dataSource.query(
      //     `
      // SELECT "CommentId", "IsDeleted"
      // FROM public."Comments" c
      // JOIN public."BanInfo" b
      // ON b."UserId" = c."UserId"
      // WHERE c."CommentId" = $1 AND c."IsDeleted" = false AND c."IsBanned" = false AND b."IsBanned" = false`,
      //     [params.commentId],
      //   );
      comment = await this.commentsRepo
        .createQueryBuilder('c')
        .innerJoin('c.user', 'u')
        .where(
          'c.id = :commentId AND c."isDeleted" = false AND c."isBanned" = false AND u."isBanned" = false',
          { commentId },
        )
        .getRawOne();
    } catch (error) {}

    if (!comment)
      throw new HttpException('POST NOT FOUND', HttpStatus.NOT_FOUND);

    return true;
  }
}
