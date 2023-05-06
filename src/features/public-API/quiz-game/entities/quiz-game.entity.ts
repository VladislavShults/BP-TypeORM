import {
  Column,
  Entity,
  JoinColumn,
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

  @Column()
  secondPlayerId: string;

  @Column()
  status: StatusGame;

  @Column()
  pairCreatedDate: Date;

  @Column({ nullable: true })
  startGameDate: Date;

  @Column({ nullable: true })
  finishGameDate: Date;

  @OneToMany(() => Answer, (answers) => answers.quizGame)
  answers: Answer[];

  @OneToMany(
    () => QuizGameQuestion,
    (quizGameQuestions) => quizGameQuestions.quizGame,
  )
  questions: QuizGameQuestion[];
}

export enum StatusGame {
  PendingSecondPlayer = 'pendingSecondPlayer',
  Active = 'active',
  Finished = 'finished',
}
