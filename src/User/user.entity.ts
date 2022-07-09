import { Entity, Column, Index, ObjectIdColumn } from 'typeorm';
import { Link } from '../types';
import { randomUUID } from 'crypto';

@Entity('User')
export class User {
  @ObjectIdColumn()
  _id: string;

  @Column()
  id: string = randomUUID();

  @Column()
  @Index({ unique: true })
  username: string;

  @Column({ nullable: true })
  links: Link[];

  @Column()
  password: string;

  @Column()
  bump = 0;
}
