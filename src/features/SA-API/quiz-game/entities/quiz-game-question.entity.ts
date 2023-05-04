import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { QuizGame } from '../../../public-API/quiz-game/entities/quiz-game.entity';

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

  @ManyToOne(() => QuizGame, (quizGame) => quizGame.questions)
  quizGame: QuizGame;
}
