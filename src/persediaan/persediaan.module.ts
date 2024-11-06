import { Module } from '@nestjs/common';
import PersediaanService from './persediaan.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Persediaan from './persediaan.entity';
import PersediaanController from './persediaan.controller';
import { CurrentUserProvider } from 'src/auth/current-user.service';
import UserModule from 'src/user/user.module';
import { CurrentUserInterceptor } from 'src/interceptors/current-user.interceptor';

@Module({
  exports: [TypeOrmModule],
  controllers: [PersediaanController],
  imports: [TypeOrmModule.forFeature([Persediaan]), UserModule],
  providers: [
    PersediaanService,
    CurrentUserInterceptor,
    CurrentUserProvider,
  ],
})
export default class PersediaanModule {}
