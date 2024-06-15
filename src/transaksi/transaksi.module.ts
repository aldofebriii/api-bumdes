import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Transaksi from './transaksi.entity';
import { Perusahaan } from 'src/perusahaan/perusahaan.entity';
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
import Debitur from 'src/utang/debitur.entity';

@Module({
  controllers: [TransaksiController],
  imports: [
    TypeOrmModule.forFeature([
      Transaksi,
      Perusahaan,
      ChartOfAccounts,
      Akun,
      Persediaan,
      Debitur,
    ]),
    HelperModule,
    PerusahaanModule,
    PersediaanModule,
  ],
  exports: [TypeOrmModule, HelperService],
  providers: [
    TransaksiService,
    HelperService,
    PerusahaanService,
    PersediaanService,
  ],
})
export default class TransaksiModule {}
