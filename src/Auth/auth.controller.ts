import {
  Body,
  Controller,
  Post,
  Headers,
  UnauthorizedException,
  Request,
  UseGuards,
  HttpCode,
  Logger
} from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { Payload, UserDTO } from '../types';
import { Auth, AuthGuard } from '../guards/auth.guard';
import { ApiHeader, ApiTags } from "@nestjs/swagger";

@Controller('auth')
@UseGuards(AuthGuard)
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly jwt: JwtService,
    private readonly authService: AuthService,
  ) {}

  @Post('create')
  async create(@Body() { username, password }: UserDTO) {
    await this.authService.create(username, password);

    return this.authService.signJWT({ where: { username } });
  }

  @Post('login')
  async login(@Body() { username, password }: UserDTO) {
    await this.authService.verifyJWT(username, password);
    return await this.authService.signJWT({ where: { username } });
  }

  @Post('refresh')
  async refresh(@Headers('Authentication-Refresh') token: string, @Request() req) {
    try {
      console.log(req.headers);
      const { id, bump } = this.jwt.verify<Payload>(token);
      await this.authService.checkJWT(id, bump);
      const v = this.authService.signJWT({ where: { id } });
      Logger.log('refresh')
      return v;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Post('logout')
  @Auth()
  @ApiHeader({
    name: 'Authentication',
    description: 'Access token',
  })
  @HttpCode(204)
  async logout(@Request() { user }) {
    await this.authService.bumpJWT({ where: { id: user.id } });
  }
}
