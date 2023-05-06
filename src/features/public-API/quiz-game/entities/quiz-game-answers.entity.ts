import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { QuizGameQuestion } from '../../../SA-API/quiz-game/entities/quiz-game-question.entity';
import { QuizGame } from './quiz-game.entity';
import { User } from '../../../SA-API/users/entities/user.entity';

@Entity('answers')
export class Answer {
  @PrimaryColumn()
  id: string;

  @OneToOne(() => QuizGameQuestion)
  @JoinColumn()
  question: QuizGameQuestion;

  @Column()
  questionId: string;

  @Column()
  answer: string;

  @Column()
  answerStatus: AnswerStatus;

  @ManyToOne(() => QuizGame, (quizGame) => quizGame.answers)
  quizGame: QuizGame;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Column()
  addedAt: Date;
}

export enum AnswerStatus {
  Correct = 'correct',
  Incorrect = 'incorrect',
}
