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
      await this.commentsRepo
        .createQueryBuilder()
        .update(Comment)
        .set({ isDeleted: true })
        .where('id = :commentId', { commentId })
        .execute();
    } catch (error) {
      return null;
    }
  }

  async updateComment(commentId: string, content: string): Promise<void> {
    await this.commentsRepo
      .createQueryBuilder()
      .update(Comment)
      .set({ content: content })
      .where('id = :commentId', { commentId })
      .execute();
  }

  async createComment(
    newComment: Omit<Comment, 'id' | 'post' | 'user'>,
  ): Promise<number> {
    const comment = await this.commentsRepo.save(newComment);
    return Number(comment.id);
  }
}
