import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { v4 as uuid } from 'uuid';

import { User, UserDocument } from './users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { Client, ClientDocument } from 'src/clients/entities/client.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
  ) {}

  async validate(username: string, password: string) {
    const user = await this.userModel.findOne({
      $or: [
        {
          username,
        },
        {
          email: username,
        },
      ],
    });
    if (!user) throw new UnauthorizedException();

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException();

    return user;
  }

  authenticate(user: User) {
    const token = this.jwtService.sign({
      sub: user.email,
      type: 'user',
    });
    return { accessToken: token };
  }

  async register(registerDto: RegisterDto) {
    const currentUser = await this.userModel.findOne({
      $or: [
        {
          username: registerDto.username,
        },
        {
          email: registerDto.email,
        },
      ],
    });
    if (currentUser) {
      throw new BadRequestException('email/username already in use');
    }
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(registerDto.password, salt);

    const user = await this.userModel.create({
      ...registerDto,
      password: hash,
    });
    return this.authenticate(user);
  }

  async oauth(clientId: string, callbackURL: string) {
    const client = await this.clientModel.findById(clientId);
    if (!client) throw new UnauthorizedException();
    if (client.callbackURL !== callbackURL) {
      throw new BadRequestException('callbackURL mismatch');
    }
    const token = uuid();
    await this.cacheService.set(token, client._id);

    const callback = new URL(client.callbackURL);
    callback.searchParams.append('token', token);

    return callback.toString();
  }

  async authorize(token: string) {
    const clientId = await this.cacheService.get(token);
    const client = await this.clientModel.findById(clientId);
    if (!client) throw new UnauthorizedException();

    const accessToken = this.jwtService.sign({
      sub: client.secret,
      type: 'client',
    });
    return { accessToken };
  }
}
