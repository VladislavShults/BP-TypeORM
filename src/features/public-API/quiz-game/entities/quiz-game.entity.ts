import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Answer } from './quiz-game-answers.entity';
import { QuizGameQuestion } from '../../../SA-API/quiz-game/entities/quiz-game-question.entity';
import { User } from '../../../SA-API/users/entities/user.entity';

@Entity()
export class QuizGame {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => User, (user) => user.quizGame, { eager: true })
  @JoinColumn()
  firstPlayer: User;

  @Column()
  firstPlayerId: string;

  @ManyToOne(() => User, (user) => user.quizGame, { eager: true })
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

  @Column({ nullable: true })
  winner: string;

  @Column({ nullable: true })
  lastResponseTimePlayers: Date;
}

export enum StatusGame {
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished',
}
