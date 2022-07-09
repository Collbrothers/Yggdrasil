import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { JwtPayload } from 'jsonwebtoken';
import { ApiProperty } from '@nestjs/swagger';

@Entity('Link')
export class Link {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  title: string;
}

export class UserDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}

export interface Payload extends JwtPayload {
  id: string;
  bump: number;
}
