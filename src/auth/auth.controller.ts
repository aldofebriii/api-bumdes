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
  AuthPerusahaanDTO,
  CurrentPerusahaan,
} from 'src/dtos/auth/auth-perusahaan.dto';
import { Response } from 'express';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Perusahaan } from 'src/perusahaan/perusahaan.entity';
import { CurrentUserInterceptor } from 'src/interceptors/current-user.interceptor';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { PerusahaanGuard } from 'src/guard/perusahaan.guard';

@UseInterceptors(new Serialize(CurrentPerusahaan))
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signin')
  async signin(
    @Body() body: AuthPerusahaanDTO,
    @Session() session: AuthSessionDTO,
  ) {
    const perusahaan = await this.authService.signin(
      body.email,
      body.kata_sandi,
    );
    session.perusahaanId = String(perusahaan.id);
    return perusahaan;
  }

  @Post('signout')
  async signout(@Session() session: AuthSessionDTO, @Res() res: Response) {
    if (session.perusahaanId) {
      session.perusahaanId = undefined;
    }
    return res.status(204).json({});
  }

  @Get('whoami')
  @UseInterceptors(CurrentUserInterceptor)
  @UseGuards(PerusahaanGuard)
  async whoami(@CurrentUser() perusahaan: Perusahaan) {
    return perusahaan;
  }
}
