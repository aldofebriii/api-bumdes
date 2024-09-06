import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import PerusahaanService from 'src/perusahaan/perusahaan.service';
import PerusahaanModule from 'src/perusahaan/perusahaan.module';
import { CurrentUserInterceptor } from 'src/interceptors/current-user.interceptor';

@Module({
  controllers: [AuthController],
  imports: [PerusahaanModule],
  providers: [AuthService, PerusahaanService, CurrentUserInterceptor],
})
export class AuthModule {}
