import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class QuizGameQuestion {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  body: string;

  @Column({ type: 'jsonb' })
  correctAnswers: string[];

  @Column()
  published: boolean;

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}
