import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class EmailConfirmation {
  @Column()
  confirmationCode: string;

  @Column()
  expirationDate: Date;

  @Column()
  isConfirmed: boolean;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  @PrimaryColumn()
  userId: string;
}
