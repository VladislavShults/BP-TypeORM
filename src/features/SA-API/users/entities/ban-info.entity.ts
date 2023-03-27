import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class BanInfo {
  @Column()
  isBanned: boolean;

  @Column({ nullable: true })
  banDate: Date | null;

  @Column({ nullable: true })
  banReason: string | null;

  @OneToOne(() => User, (u) => u.banInfo)
  @JoinColumn()
  user: User;

  @Column()
  @PrimaryColumn()
  userId: string;
}
