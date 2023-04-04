import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Comment) private commentsRepo: Repository<Comment>,
  ) {}

  async deleteCommentById(commentId: string): Promise<boolean> {
    try {
      await this.dataSource.query(
        `
      UPDATE public."Comments"
    SET "IsDeleted"=true
    WHERE "CommentId" = $1;`,
        [commentId],
      );
    } catch (error) {
      return null;
    }
  }

  async updateComment(commentId: string, content: string): Promise<void> {
    await this.dataSource.query(
      `
    UPDATE public."Comments"
    SET "Content"=$1
    WHERE "CommentId" = $2;`,
      [content, commentId],
    );
  }

  // async createComment(
  //   content: string,
  //   postId: string,
  //   userId: string,
  // ): Promise<number> {
  //   const newComment = await this.dataSource.query(
  //     `
  //   INSERT INTO public."Comments"("Content", "UserId","PostId")
  //   VALUES ($1, $2, $3)
  //   RETURNING "CommentId" as "commentId"`,
  //     [content, userId, postId],
  //   );
  //
  //   return newComment[0].commentId;
  // }
  async createComment(
    newComment: Omit<Comment, 'id' | 'post' | 'user'>,
  ): Promise<number> {
    const comment = await this.commentsRepo.save(newComment);
    return Number(comment.id);
  }
}
