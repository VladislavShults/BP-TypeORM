import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { ImageEntity } from '../../../../shared/entities/base-image-entity';
import { Blog } from './blog.entity';

@Entity('mainImages')
export class MainImage extends ImageEntity {
  @OneToOne(() => Blog, (b) => b.main)
  @JoinColumn()
  blog: Blog;

  @Column()
  blogId: number;
}
