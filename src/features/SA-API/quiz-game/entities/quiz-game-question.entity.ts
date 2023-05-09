import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class QuizGameQuestion {
  @PrimaryColumn()
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

  @Column()
  isDeleted: boolean;
}
