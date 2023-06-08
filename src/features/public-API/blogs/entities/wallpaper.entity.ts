import { Column, Entity } from 'typeorm';
import { ImageEntity } from '../../../../shared/entities/base-image-entity';

@Entity('wallpapers')
export class Wallpaper extends ImageEntity {
  @Column()
  blogId: string;
}
