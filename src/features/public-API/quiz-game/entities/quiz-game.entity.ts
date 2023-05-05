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
  firstPlayerId: User;

  @OneToOne(() => User)
  @JoinColumn()
  secondPlayerId: User;

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
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished',
}
