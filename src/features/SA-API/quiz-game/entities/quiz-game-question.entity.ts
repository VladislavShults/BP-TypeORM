import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PublishedStatuses } from '../types/quiz.types';

@Entity()
export class QuizGameQuestion {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  body: string;

  @Column({ type: 'jsonb' })
  correctAnswers: string[];

  @Column()
  published: PublishedStatuses;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
