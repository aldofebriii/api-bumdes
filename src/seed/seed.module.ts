import { Module } from '@nestjs/common';
import PersediaanModule from 'src/persediaan/persediaan.module';
import PersediaanService from 'src/persediaan/persediaan.service';
import PerusahaanModule from 'src/perusahaan/perusahaan.module';
import PerusahaanService from 'src/perusahaan/perusahaan.service';
import TransaksiModule from 'src/transaksi/transaksi.module';
import TransaksiService from 'src/transaksi/transaksi.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Perusahaan, Pimpinan } from 'src/perusahaan/perusahaan.entity';
import Transaksi from 'src/transaksi/transaksi.entity';
import Persediaan from 'src/persediaan/persediaan.entity';
import { Akun, ChartOfAccounts } from 'src/akun/akun.entity';
import SeedService from './seed.service';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '12345678',
      database: 'bumdes',
      entities: [
        Pimpinan,
        Perusahaan,
        Transaksi,
        Persediaan,
        Akun,
        ChartOfAccounts,
      ],
      synchronize: true,
      logging: 'all',
    }),
    TransaksiModule,
    PerusahaanModule,
    PersediaanModule,
  ],
  providers: [
    SeedService,
    TransaksiService,
    PerusahaanService,
    PersediaanService,
  ],
})
export default class SeedModule {}
