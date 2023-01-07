import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { BasicGuard } from './guards/basic.guard';
import { LocalGuard } from './guards/local.guard';
import { User } from './users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/local')
  @UseGuards(LocalGuard)
  local(@Req() req: Request) {
    return this.authService.authenticate(req.user as User);
  }

  @Post('/basic')
  @UseGuards(BasicGuard)
  basic(@Req() req: Request) {
    return this.authService.authenticate(req.user as User);
  }

  @Post('/register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('/oauth')
  async oauth(
    @Query('client_id') clientId: string,
    @Query('callback_url') callbackURL: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const callback = await this.authService.oauth(clientId, callbackURL);
    res.redirect(callback);
  }

  @Get('/oauth/callback')
  async oauthCallback(@Query('token') token: string) {
    return this.authService.authorize(token);
  }
}
