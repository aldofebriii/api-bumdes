import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Transaksi from './transaksi.entity';
import { Akun, ChartOfAccounts } from 'src/akun/akun.entity';
import TransaksiController from './transaksi.controller';
import TransaksiService from './transaksi.service';
import HelperService from 'src/helper/helper.service';
import HelperModule from 'src/helper/helper.module';
import Persediaan from 'src/persediaan/persediaan.entity';
import PerusahaanModule from 'src/perusahaan/perusahaan.module';
import PerusahaanService from 'src/perusahaan/perusahaan.service';
import PersediaanModule from 'src/persediaan/persediaan.module';
import PersediaanService from 'src/persediaan/persediaan.service';
import Pihak from 'src/utang-piutang/pihak.entity';
import PihakService from 'src/utang-piutang/pihak.service';
import { CurrentPerusahaanProvider } from 'src/auth/current-perusahaan.service';
import { CurrentUserInterceptor } from 'src/interceptors/current-user.interceptor';

@Module({
  controllers: [TransaksiController],
  imports: [
    TypeOrmModule.forFeature([
      Transaksi,
      ChartOfAccounts,
      Akun,
      Persediaan,
      Pihak,
    ]),
    HelperModule,
    PersediaanModule,
    PerusahaanModule,
  ],
  exports: [TypeOrmModule, HelperService],
  providers: [
    TransaksiService,
    HelperService,
    PersediaanService,
    PihakService,
    CurrentUserInterceptor,
    CurrentPerusahaanProvider,
  ],
})
export default class TransaksiModule {}
