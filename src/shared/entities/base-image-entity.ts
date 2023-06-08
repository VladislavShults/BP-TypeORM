import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export abstract class ImageEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  url: string;

  @Column()
  width: number;

  @Column()
  height: number;

  @Column()
  fileSize: number;

  @Column()
  createdAt: Date;
}
