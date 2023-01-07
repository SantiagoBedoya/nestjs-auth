import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as fs from 'fs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: fs
        .readFileSync(configService.get<string>('JWT_PUBLIC_KEY'))
        .toString(),
      ignoreExpiration: false,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload) {
    const { sub, type } = payload;
    if (type === 'client') return {};
    const user = await this.userModel.findById(sub);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
