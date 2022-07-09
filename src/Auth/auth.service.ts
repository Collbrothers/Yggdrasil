import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../User/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { hash, verify } from 'argon2';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private options = {
    secret: Buffer.from(process.env.SECRET, 'utf8'),
    hashLength: (process.env.HASH_LENGTH as unknown as number) || 64,
    timeCost: (process.env.TIME_COST as unknown as number) || 9,
    memoryCost: (process.env.MEMORY_COST as unknown as number) || 125000,
    parallelism: (process.env.PARALLELISM as unknown as number) || 1,
    type: (process.env.TYPE as unknown as 0 | 1 | 2) || 2,
  };

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(username: string, password: string): Promise<User> {
    if (await this.userRepository.findOne({ where: { username } }))
      throw new ConflictException('Username already exists');
    password = await hash(password, this.options);

    const repo = this.userRepository.create({
      username,
      password,
    });

    await this.userRepository.save(repo);

    return repo;
  }

  async checkJWT(uid: string, bump: number): Promise<User> {
    return await this.userRepository.findOne({ where: { id: uid, bump } });
  }

  async bumpJWT(uid: FindOneOptions<User>) {
    const { id, bump } = await this.userRepository.findOne(uid);

    return await this.userRepository.update({ id }, { bump: bump + 1 });
  }

  async signJWT(uid: FindOneOptions<User>) {
    const { id, bump } = await this.userRepository.findOne(uid);
    const shortcut = { id, bump };

    return {
      access: this.jwtService.sign(shortcut),
      refresh: this.jwtService.sign(shortcut, {
        expiresIn: '7d',
        secret: process.env.REFRESH_SECRET,
      }),
    };
  }

  async verifyJWT(username: string, password: string) {
    const user = await this.userRepository.findOne({ where: { username } });

    if (!(await verify(user.password, password, this.options)))
      throw new UnauthorizedException('Invalid credentials');
  }
}
