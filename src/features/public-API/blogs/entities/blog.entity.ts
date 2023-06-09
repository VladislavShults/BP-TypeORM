import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../SA-API/users/entities/user.entity';
import { Wallpaper } from './wallpaper.entity';
import { MainImage } from './main-image.entity';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  blogName: string;

  @Column()
  description: string;

  @Column()
  websiteUrl: string;

  @Column()
  createdAt: Date;

  @Column()
  isDeleted: boolean;

  @Column()
  isBanned: boolean;

  @Column({ nullable: true })
  banDate: Date;

  @Column()
  isMembership: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @OneToOne(() => Wallpaper, (w) => w.blog)
  wallpapers: Wallpaper;

  @OneToOne(() => MainImage, (m) => m.blog)
  main: MainImage;
}
