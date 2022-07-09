import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  findOne(uid: FindOneOptions<User>): Promise<User> {
    const user = this.userRepository.findOne(uid);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
