import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Pihak from './pihak.entity';
import PihakService from './pihak.service';
import HelperModule from 'src/helper/helper.module';
import HelperService from 'src/helper/helper.service';
import PihakController from './pihak.controller';
import { CurrentUserProvider } from 'src/auth/current-user.service';
import { CurrentUserInterceptor } from 'src/interceptors/current-user.interceptor';
import UserModule from 'src/user/user.module';
@Module({
  controllers: [PihakController],
  imports: [TypeOrmModule.forFeature([Pihak]), HelperModule, UserModule],
  providers: [
    PihakService,
    HelperService,
    CurrentUserProvider,
    CurrentUserInterceptor,
  ],
  exports: [PihakService,TypeOrmModule,],
})
export default class PihakModule {}
