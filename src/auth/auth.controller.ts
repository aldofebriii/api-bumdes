import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  Session,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSessionDTO } from 'src/dtos/auth/auth-session.dto';
import {
  AuthUserDTO,
  CurrentUserDTO,
} from 'src/dtos/auth/auth-user.dto';
import { Response } from 'express';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/user/user.entity';
import { CurrentUserInterceptor } from 'src/interceptors/current-user.interceptor';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserGuard } from 'src/guard/user.guard';

@UseInterceptors(new Serialize(CurrentUserDTO))
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signin')
  async signin(
    @Body() body: AuthUserDTO,
    @Session() session: AuthSessionDTO,
  ) {
    const user = await this.authService.signin(
      body.email,
      body.kata_sandi,
    );
    session.userId = String(user.id);
    return user;
  }

  @Post('signout')
  async signout(@Session() session: AuthSessionDTO, @Res() res: Response) {
    if (session.userId) {
      session.userId = undefined;
    }
    return res.status(204).json({});
  }

  @Get('whoami')
  @UseInterceptors(CurrentUserInterceptor)
  @UseGuards(UserGuard)
  async whoami(@CurrentUser() user: User) {
    return user;
  }
}
