import { Injectable } from '@nestjs/common';
import {
  ViewPostsTypeWithPagination,
  ViewPostType,
} from '../types/posts.types';
import { mapPost } from '../helpers/mapPostDBToViewModel';
import { QueryGetPostsByBlogIdDto } from '../../blogs/api/models/query-getPostsByBlogId.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { PostMainImage } from '../entities/post-main-image.entity';
import { mapPostMainImageDbToView } from '../helpers/map-post-main-image-db-to-view';
import { QueryPostDto } from './models/query-post.dto';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Post) private postsRepo: Repository<Post>,
    @InjectRepository(PostMainImage)
    private postsMainImageRepo: Repository<PostMainImage>,
  ) {}

  async getPostById(
    postId: string,
    userId?: string,
  ): Promise<ViewPostType | null> {
    const queryBuilder = this.queryRunner()
      .andWhere('p.id = :postId')
      .setParameters({
        isDeleted: false,
        like: 'Like',
        dislike: 'Dislike',
        postId,
      });

    this.checkUserIdAndGetHisStatus(queryBuilder, userId);

    const postDBType = await queryBuilder.getRawOne();

    if (!postDBType) return null;

    const post = mapPost(postDBType);

    return post;
  }

  async getPosts(
    query: QueryPostDto,
    userId: string,
  ): Promise<ViewPostsTypeWithPagination> {
    let { sortBy } = query;
    const { sortDirection, pageSize, pageNumber } = query;

    if (sortBy === 'name') sortBy = 'blogName';

    const queryBuilder = this.queryRunner()
      .orderBy(`p.${sortBy}`, sortDirection)
      .skip((pageNumber - 1) * pageSize)
      .take(pageSize);

    this.checkUserIdAndGetHisStatus(queryBuilder, userId);

    const postDBType = await queryBuilder.getRawMany();
    const totalCount = Number(await queryBuilder.getCount());

    const items = postDBType.map((i) => mapPost(i));

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount,
      items,
    };
  }

  async getPostsByBlogId(
    blogId: string,
    query: QueryGetPostsByBlogIdDto,
    userId: string,
  ): Promise<ViewPostsTypeWithPagination | null> {
    let { sortBy } = query;
    const { sortDirection, pageSize, pageNumber } = query;

    if (sortBy === 'name') sortBy = 'blogName';

    const queryBuilder = this.queryRunner()
      .andWhere('p.blogId = :blogId')
      .setParameters({
        blogId,
        isDeleted: false,
        like: 'Like',
        dislike: 'Dislike',
      })
      .orderBy(`p.${sortBy}`, sortDirection)
      .skip((pageNumber - 1) * pageSize)
      .take(pageSize);

    this.checkUserIdAndGetHisStatus(queryBuilder, userId);

    const itemsDBType = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();

    const items = itemsDBType.map((i) => mapPost(i));

    const totalCount = Number(count);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount,
      items,
    };
  }

  async getPostByIdWithUserId(postId: string): Promise<Post> {
    const post = await this.dataSource
      .getRepository(Post)
      .find({ where: { id: postId } });

    return post[0];
  }

  async getMainImageForPost(postId: number) {
    const postInfo = await this.postsMainImageRepo.find({
      where: { postId: postId },
    });
    // const result = mapPostMainImageDbToView(postInfo);
    const result = postInfo.map((i) => mapPostMainImageDbToView(i));

    return result;
  }

  private queryRunner() {
    return this.dataSource
      .getRepository(Post)
      .createQueryBuilder('p')
      .select([
        'p.id as "id"',
        'p.title as "title"',
        'p.shortDescription as "shortDescription"',
        'p.content as "content"',
        'p.createdAt as "createdAt"',
        'p.blogId as "blogId"',
        'p.newestLikes as "newestLikes"',
        'b.blogName as "blogName"',
        'm.url as "url"',
        'm.height as "height"',
        'm.width as "width"',
        'm.fileSize as "fileSize"',
        `COUNT(likes.id) AS "likesCount"`,
        `COUNT(dislikes.id) AS "dislikesCount"`,
      ])
      .leftJoin('p.blog', 'b')
      .leftJoin('p.main', 'm')
      .leftJoin('p.postLikeOrDislike', 'likes', 'likes.status = :like')
      .leftJoin('p.postLikeOrDislike', 'dislikes', 'dislikes.status = :dislike')
      .groupBy('p.id, b.id, m.id')
      .where('p.isDeleted = :isDeleted')
      .setParameters({
        isDeleted: false,
        like: 'Like',
        dislike: 'Dislike',
      });
  }

  private checkUserIdAndGetHisStatus(queryBuilder, userId) {
    if (userId) {
      queryBuilder
        .addSelect(`my.status AS "myStatus"`)
        .leftJoin('p.postLikeOrDislike', 'my', 'my."userId" = :userId')
        .groupBy('p.id, b.id, m.id, my.status')
        .setParameter('userId', userId);
    }
  }
}
