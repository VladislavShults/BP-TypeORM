import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../SA-API/users/entities/user.entity';
import { Blog } from '../../blogs/entities/blog.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  title: string;

  @Column()
  shortDescription: string;

  @Column()
  content: string;

  @Column()
  createdAt: Date;

  @Column()
  isDeleted: boolean;

  @Column()
  isBanned: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Blog)
  @JoinColumn({ name: 'blogId' })
  blog: Blog;

  @Column()
  blogId: string;

  @Column({ type: 'jsonb' })
  newestLikes: object[];
}