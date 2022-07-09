import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Payload } from '../types';
import { UserService } from '../user/user.service';

const AUTH_KEY = 'AUTHENTICATION';
export const Auth = () => SetMetadata(AUTH_KEY, true);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('AuthGuard');
    const required = this.reflector.getAllAndOverride(AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (typeof required === 'undefined') return true;
    const req = context.switchToHttp().getRequest();
    const {
      headers: { authentication },
    } = req;
    if (!authentication) return false;
    try {
      const { id, bump } = this.jwtService.verify<Payload>(authentication);
      req.user = !!req.user
        ? req.user
        : await this.userService.findOne({ where: { id, bump } });
      if (!req.user) return false;
    } catch (error) {
      return false;
    }
    return true;
  }
}
