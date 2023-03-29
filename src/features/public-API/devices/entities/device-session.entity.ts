import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { uuid } from 'uuidv4';
import { User } from '../../../SA-API/users/entities/user.entity';

@Entity()
export class DeviceSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  deviceId: string;

  @Column()
  ip: string;

  @Column()
  deviceName: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: number;

  @Column()
  lastActiveDate: Date;

  @Column()
  expiresAt: string;

  @Column()
  issuedAt: string;
}
