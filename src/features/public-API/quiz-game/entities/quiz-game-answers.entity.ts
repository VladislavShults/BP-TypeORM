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

@Entity()
export class Answers {
  @PrimaryColumn()
  id: string;

  @OneToOne(() => QuizGame)
  @JoinColumn()
  game: QuizGame;

  @OneToOne(() => QuizGameQuestion)
  @JoinColumn()
  question: QuizGameQuestion;

  @Column()
  answer: string;

  @Column()
  answerStatus: AnswerStatus;

  @ManyToOne(() => QuizGame, (quizGame) => quizGame.answers)
  quizGame: QuizGame;
}

export enum AnswerStatus {
  Correct = 'correct',
  Incorrect = 'incorrect',
}
