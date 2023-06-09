import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BanInfo } from './ban-info.entity';
import { EmailConfirmation } from './email-confirmation.entity';
import { QuizGame } from '../../../public-API/quiz-game/entities/quiz-game.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  login: string;

  @Column()
  email: string;

  @Column()
  createdAt: Date;

  @Column()
  passwordHash: string;

  @Column()
  isDeleted: boolean;

  @Column()
  isBanned: boolean;

  @OneToOne(() => BanInfo, (b) => b.user)
  banInfo: Omit<BanInfo, 'userId'>;

  @OneToOne(() => EmailConfirmation, (e) => e.user)
  emailConfirmation: Omit<EmailConfirmation, 'userId'>;

  @OneToOne(() => QuizGame, (q) => q.firstPlayer || q.secondPlayer)
  quizGame: QuizGame;
}
