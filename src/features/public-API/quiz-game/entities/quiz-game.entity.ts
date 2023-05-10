import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Answer } from './quiz-game-answers.entity';
import { QuizGameQuestion } from '../../../SA-API/quiz-game/entities/quiz-game-question.entity';
import { User } from '../../../SA-API/users/entities/user.entity';

@Entity()
export class QuizGame {
  @PrimaryColumn()
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  firstPlayer: User;

  @Column()
  firstPlayerId: string;

  @OneToOne(() => User)
  @JoinColumn()
  secondPlayer: User;

  @Column({ nullable: true })
  secondPlayerId: string;

  @Column()
  status: StatusGame;

  @Column()
  pairCreatedDate: Date;

  @Column({ nullable: true })
  startGameDate: Date;

  @Column({ nullable: true })
  finishGameDate: Date;

  @OneToMany(() => Answer, (answers) => answers.quizGame, { cascade: true })
  answers: Answer[];

  @ManyToMany(() => QuizGameQuestion, { cascade: true })
  @JoinTable()
  questions: QuizGameQuestion[];

  @Column()
  scoreFirstPlayer: number;

  @Column()
  scoreSecondPlayer: number;
}

export enum StatusGame {
  PendingSecondPlayer = 'pendingSecondPlayer',
  Active = 'active',
  Finished = 'finished',
}
