import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Answers } from './quiz-game-answers.entity';
import { QuizGameQuestion } from '../../../SA-API/quiz-game/entities/quiz-game-question.entity';

@Entity()
export class QuizGame {
  @PrimaryColumn()
  id: string;

  @Column()
  firstPlayerId: string;

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

  @OneToMany(() => Answers, (answers) => answers.quizGame)
  answers: Answers[];

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
