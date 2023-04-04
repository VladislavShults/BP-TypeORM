import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../../SA-API/users/entities/user.entity';
import { Blog } from '../../../public-API/blogs/entities/blog.entity';

@Entity()
export class BannedUsersForBlog {
  @Column()
  isBanned: boolean;

  @Column()
  banDate: Date;

  @Column()
  banReason: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @PrimaryColumn()
  userId: string;

  @ManyToOne(() => Blog)
  @JoinColumn({ name: 'blogId' })
  blog: Blog;

  @PrimaryColumn()
  blogId: string;
}
