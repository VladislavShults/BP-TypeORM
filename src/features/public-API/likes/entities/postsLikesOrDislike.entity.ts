import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../SA-API/users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';

@Entity()
export class PostsLikesOrDislike {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  status: string;

  @Column()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Post, (p) => p.postLikeOrDislike)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column()
  postId: string;
}
