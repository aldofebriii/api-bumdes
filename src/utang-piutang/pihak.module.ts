import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Pihak from './pihak.entity';
import PihakService from './pihak.service';
import HelperModule from 'src/helper/helper.module';
import HelperService from 'src/helper/helper.service';
import PihakController from './pihak.controller';
import { CurrentPerusahaanProvider } from 'src/auth/current-perusahaan.service';
import { CurrentUserInterceptor } from 'src/interceptors/current-user.interceptor';
import PerusahaanModule from 'src/perusahaan/perusahaan.module';
@Module({
  controllers: [PihakController],
  imports: [TypeOrmModule.forFeature([Pihak]), HelperModule, PerusahaanModule],
  providers: [
    PihakService,
    HelperService,
    CurrentPerusahaanProvider,
    CurrentUserInterceptor,
  ],
  exports: [PihakService,TypeOrmModule,],
})
export default class PihakModule {}
