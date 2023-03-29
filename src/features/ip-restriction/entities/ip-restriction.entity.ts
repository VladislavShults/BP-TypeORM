import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class IpRestriction {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  url: string;

  @Column()
  currentIp: string;

  @Column()
  entryTime: Date;
}
