import * as fs from 'fs';

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from './users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { BasicStrategy } from './strategies/basic.strategy';
import { ClientsModule } from 'src/clients/clients.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ApiKeyStrategy } from './strategies/api-key.strategy';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        privateKey: fs
          .readFileSync(configService.get<string>('JWT_PRIVATE_KEY'))
          .toString(),
        publicKey: fs
          .readFileSync(configService.get<string>('JWT_PUBLIC_KEY'))
          .toString(),
        signOptions: {
          algorithm: 'RS256',
          expiresIn: '2h',
        },
      }),
    }),
    UsersModule,
    ClientsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    BasicStrategy,
    JwtStrategy,
    ApiKeyStrategy,
  ],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
