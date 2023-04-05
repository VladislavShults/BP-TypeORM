import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../SA-API/users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { LikeType } from '../types/likes.types';

@Entity()
export class CommentsLikesOrDislike {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  status: LikeType;

  @Column()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Comment)
  @JoinColumn({ name: 'commentId' })
  comment: Comment;

  @Column()
  commentId: string;
}
