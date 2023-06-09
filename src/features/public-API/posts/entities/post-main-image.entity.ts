import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { ImageEntity } from '../../../../shared/entities/base-image-entity';
import { Post } from './post.entity';

@Entity('postMainImages')
export class PostMainImage extends ImageEntity {
  @OneToOne(() => Post, (p) => p.main)
  @JoinColumn()
  post: Post;

  @Column()
  postId: number;
}
