import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ImageEntity } from '../../../../shared/entities/base-image-entity';
import { Post } from './post.entity';

@Entity('postMainImages')
export class PostMainImage extends ImageEntity {
  @ManyToOne(() => Post, (p) => p.main)
  @JoinColumn()
  post: Post;

  @Column()
  postId: number;

  constructor(
    id: string,
    url: string,
    width: number,
    height: number,
    fileSize: number,
    postId: number,
    createdAt: Date,
  ) {
    super();
    this.id = id;
    this.url = url;
    this.width = width;
    this.height = height;
    this.fileSize = fileSize;
    this.postId = postId;
    this.createdAt = createdAt;
  }
}
