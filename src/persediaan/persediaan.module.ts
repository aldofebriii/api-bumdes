import { Module } from '@nestjs/common';
import PersediaanService from './persediaan.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Persediaan from './persediaan.entity';
import PersediaanController from './persediaan.controller';
import { CurrentPerusahaanProvider } from 'src/auth/current-perusahaan.service';
import PerusahaanModule from 'src/perusahaan/perusahaan.module';
import { CurrentUserInterceptor } from 'src/interceptors/current-user.interceptor';

@Module({
  exports: [TypeOrmModule],
  controllers: [PersediaanController],
  imports: [TypeOrmModule.forFeature([Persediaan]), PerusahaanModule],
  providers: [
    PersediaanService,
    CurrentUserInterceptor,
    CurrentPerusahaanProvider,
  ],
})
export default class PersediaanModule {}
