import { Injectable } from '@nestjs/common';
import { LikesRepository } from '../infrastructure/likes.repository';
import { LikeType } from '../types/likes.types';
import { NewestLikesType } from '../../posts/types/posts.types';
import { CommentsLikesOrDislike } from '../entities/commentsLikesOrDislike';
import { PostsLikesOrDislike } from '../entities/postsLikesOrDislike.entity';

@Injectable()
export class LikesService {
  constructor(private readonly likesRepository: LikesRepository) {}

  async makeLikeOrDislikeForPosts(
    postId: string,
    userId: string,
    likeStatus: LikeType,
  ): Promise<boolean> {
    const myStatus = await this.likesRepository.getMyLikeStatusForPost(
      postId,
      userId,
    );

    if (myStatus === likeStatus) return true;

    if (likeStatus !== 'None') {
      return await this.makeLikeOrDislikePost(
        postId,
        userId,
        likeStatus,
        myStatus,
      );
    }

    if (likeStatus === 'None') {
      return await this.resetLikePost(postId, userId);
    }
    return true;
  }

  private async makeLikeOrDislikePost(
    postId: string,
    userId: string,
    likeStatus: LikeType,
    myStatus: LikeType,
  ): Promise<boolean> {
    if (myStatus === 'None') {
      const newLike: Omit<PostsLikesOrDislike, 'id' | 'user' | 'post'> = {
        status: likeStatus,
        createdAt: new Date(),
        userId,
        postId,
      };
      await this.likesRepository.saveLikeOrUnlikeForPost(newLike);
    } else {
      await this.likesRepository.changeLikeStatusForPost(
        postId,
        userId,
        likeStatus,
      );
    }
    return true;
  }

  private async resetLikePost(
    postId: string,
    userId: string,
  ): Promise<boolean> {
    await this.likesRepository.removeLikeOrDislikeForPost(postId, userId);
    return true;
  }

  async makeLikeOrDislikeForComment(
    commentId: string,
    userId: string,
    likeStatus: LikeType,
  ): Promise<boolean> {
    const myStatus = await this.likesRepository.getMyLikeStatusForComment(
      commentId,
      userId,
    );

    if (myStatus === likeStatus) return true;

    if (likeStatus !== 'None') {
      return await this.makeLikeOrDislikeComment(
        commentId,
        userId,
        likeStatus,
        myStatus,
      );
    }

    if (likeStatus === 'None') {
      return await this.resetLikeComment(commentId, userId);
    }
    return true;
  }

  private async makeLikeOrDislikeComment(
    commentId: string,
    userId: string,
    likeStatus: LikeType,
    myStatus: LikeType,
  ): Promise<boolean> {
    if (myStatus === 'None') {
      const myLike: Omit<CommentsLikesOrDislike, 'id' | 'user' | 'comment'> = {
        status: likeStatus,
        createdAt: new Date(),
        userId,
        commentId,
      };
      await this.likesRepository.saveLikeOrUnlikeForComment(myLike);
    } else {
      await this.likesRepository.changeLikeStatusForComment(
        commentId,
        userId,
        likeStatus,
      );
    }
    return true;
  }

  private async resetLikeComment(commentId: string, userId: string) {
    await this.likesRepository.removeLikeOrDislikeForComment(commentId, userId);
    return true;
  }

  async updateNewestLikesForPost(postId: string) {
    const threeNewestLikes: NewestLikesType[] =
      await this.likesRepository.getThreeNewestLikesForPost(postId);

    await this.likesRepository.updateNewestLikesForPost(
      postId,
      threeNewestLikes,
    );
  }
}
