import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy as Strategy } from 'passport-headerapikey';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super(
      { header: 'api-key', prefix: '' },
      true,
      (apiKey: string, done, req) => {
        return done({ apiKey }, true);
      },
    );
  }
}
