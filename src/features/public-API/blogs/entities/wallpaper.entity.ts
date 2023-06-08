import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { ImageEntity } from '../../../../shared/entities/base-image-entity';
import { Blog } from './blog.entity';

@Entity('wallpapers')
export class Wallpaper extends ImageEntity {
  @OneToOne(() => Blog, (b) => b.wallpapers)
  @JoinColumn()
  blog: Blog;

  @Column()
  blogId: number;
}
