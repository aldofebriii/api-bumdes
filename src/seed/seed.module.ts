import { Module } from '@nestjs/common';
import PersediaanModule from 'src/persediaan/persediaan.module';
import PersediaanService from 'src/persediaan/persediaan.service';
import PerusahaanModule from 'src/perusahaan/perusahaan.module';
import PerusahaanService from 'src/perusahaan/perusahaan.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Akun, ChartOfAccounts } from 'src/akun/akun.entity';
import SeedService from './seed.service';
import { Perusahaan, Pimpinan } from 'src/perusahaan/perusahaan.entity';
import Persediaan from 'src/persediaan/persediaan.entity';
import Transaksi from 'src/transaksi/transaksi.entity';
import Pihak from 'src/utang-piutang/pihak.entity';
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
        Persediaan,
        ChartOfAccounts,
        Transaksi,
        Akun,
        Pihak,
      ],
      synchronize: true,
      logging: 'all',
    }),
    TypeOrmModule.forFeature([ChartOfAccounts, Akun]),
    PerusahaanModule,
    PersediaanModule,
  ],
  providers: [SeedService, PerusahaanService, PersediaanService],
})
export default class SeedModule {}
