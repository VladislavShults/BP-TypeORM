import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { CreateCommentDto } from '../api/models/create-comment.dto';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async createCommentByPost(
    postId: string,
    inputModel: CreateCommentDto,
    userId: string,
  ): Promise<number> {
    const newComment: Omit<Comment, 'id' | 'post' | 'user'> = {
      createdAt: new Date(),
      isDeleted: false,
      isBanned: false,
      userId,
      postId,
      content: inputModel.content,
    };
    return await this.commentsRepository.createComment(newComment);
  }

  async deleteCommentById(commentId: string): Promise<boolean> {
    return await this.commentsRepository.deleteCommentById(commentId);
  }

  async updateComment(commentId: string, content: string) {
    return await this.commentsRepository.updateComment(commentId, content);
  }
}
