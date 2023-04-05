import { Injectable } from '@nestjs/common';
import { LikeType } from '../types/likes.types';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { NewestLikesType } from '../../posts/types/posts.types';
import { CommentsLikesOrDislike } from '../entities/commentsLikesOrDislike';
import { PostsLikesOrDislike } from '../entities/postsLikesOrDislike.entity';
import { Post } from '../../posts/entities/post.entity';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(CommentsLikesOrDislike)
    private commentsLikesRepo: Repository<CommentsLikesOrDislike>,
    @InjectRepository(PostsLikesOrDislike)
    private postsLikesRepo: Repository<PostsLikesOrDislike>,
    @InjectRepository(Post)
    private postsRepo: Repository<Post>,
  ) {}

  async saveLikeOrUnlikeForPost(
    newLike: Omit<PostsLikesOrDislike, 'id' | 'user' | 'post'>,
  ) {
    try {
      await this.postsLikesRepo.save(newLike);
    } catch (error) {
      return null;
    }
  }

  async changeLikeStatusForPost(
    postId: string,
    userId: string,
    likeStatus: LikeType,
  ) {
    try {
      await this.postsLikesRepo
        .createQueryBuilder()
        .update(PostsLikesOrDislike)
        .set({ status: likeStatus, createdAt: new Date() })
        .where('"userId" = :userId AND "postId" = :postId', { userId, postId })
        .execute();
    } catch (error) {}
  }

  private async getMyLikeStatusForPostOrComment(
    postIdOrCommentId: string,
    userId: string,
    postOrComment: string,
  ): Promise<LikeType> {
    let table: string;

    if (postOrComment === 'post') {
      table = 'posts_likes_or_dislike';
    }
    if (postOrComment === 'comment') {
      table = 'comments_likes_or_dislike';
    }

    let myStatus = [];

    try {
      myStatus = await this.dataSource.query(
        `
    SELECT "status" as "myStatus"
    FROM public.${'"' + table + '"'}
    WHERE 'id' = $1 AND "UserId" = $2`,
        [postIdOrCommentId, userId],
      );
    } catch (error) {
      myStatus = [];
    }

    if (myStatus.length === 0) return 'None';
    else return myStatus[0].myStatus;
  }

  async getMyLikeStatusForPost(
    postId: string,
    userId: string,
  ): Promise<LikeType> {
    return this.getMyLikeStatusForPostOrComment(postId, userId, 'post');
  }

  async removeLikeOrDislikeForPost(postId: string, userId: string) {
    try {
      await this.dataSource.query(
        `
    DELETE FROM public."PostsLikesOrDislike"
    WHERE "PostId" = $1 AND "UserId" = $2;`,
        [postId, userId],
      );
    } catch (error) {
      return null;
    }
  }

  async getMyLikeStatusForComment(commentId: string, userId: string) {
    return this.getMyLikeStatusForPostOrComment(commentId, userId, 'comment');
  }

  async saveLikeOrUnlikeForComment(
    myLike: Omit<CommentsLikesOrDislike, 'id' | 'user' | 'comment'>,
  ) {
    try {
      await this.commentsLikesRepo.save(myLike);
    } catch (error) {
      return null;
    }
  }

  async changeLikeStatusForComment(
    commentId: string,
    userId: string,
    likeStatus: LikeType,
  ) {
    try {
      await this.commentsLikesRepo
        .createQueryBuilder()
        .update(CommentsLikesOrDislike)
        .set({ status: likeStatus, createdAt: new Date() })
        .where('"userId" = :userId AND "commentId" = :commentId', {
          userId,
          commentId,
        })
        .execute();
    } catch (error) {}
  }

  async removeLikeOrDislikeForComment(commentId: string, userId: string) {
    try {
      await this.commentsLikesRepo
        .createQueryBuilder()
        .delete()
        .where('"commentId" = :commentId AND "userId" = :userId', {
          commentId,
          userId,
        })
        .execute();
    } catch (error) {
      return null;
    }
  }

  async getThreeNewestLikesForPost(postId: string) {
    return this.dataSource.query(
      `
    SELECT pl."createdAt" as "addedAt", pl."userId":: character varying as "userId", u."login" as "login" 
    FROM public."posts_likes_or_dislike" pl
    JOIN public."user" u
    ON pl."userId" = u."id"
    JOIN public."ban_info" b
    ON b."userId" = u."id"
    WHERE "status" = 'Like' AND pl."postId" = $1 AND b."isBanned" = false
    ORDER BY "addedAt" desc
    LIMIT 3 OFFSET 0`,
      [postId],
    );
  }

  async updateNewestLikesForPost(
    postId: string,
    threeNewestLikes: NewestLikesType[],
  ) {
    await this.postsRepo
      .createQueryBuilder()
      .update(Post)
      .set({ newestLikes: threeNewestLikes })
      .where('id = :postId', { postId })
      .execute();
  }
}
