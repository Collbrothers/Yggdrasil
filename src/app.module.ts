import { Global, Module } from "@nestjs/common";
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './User/user.module';
import { AuthModule } from './Auth/auth.module';

@Global()
@Module({
  imports: [
    UserModule,
    AuthModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.MONGODB_URL,
      database: process.env.DATABASE || 'yggdrasil',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      dropSchema: !!process.env.TEST
    }),
    JwtModule.register({
      secret: process.env.SECRET,
    }),
  ],
  exports: [JwtModule],
})
export class AppModule {}
