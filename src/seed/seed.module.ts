import { Module } from '@nestjs/common';
import PersediaanModule from 'src/persediaan/persediaan.module';
import PersediaanService from 'src/persediaan/persediaan.service';
import PerusahaanModule from 'src/perusahaan/perusahaan.module';
import PerusahaanService from 'src/perusahaan/perusahaan.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Akun, ChartOfAccounts } from 'src/akun/akun.entity';
import SeedService from './seed.service';
import { Perusahaan } from 'src/perusahaan/perusahaan.entity';
import Persediaan from 'src/persediaan/persediaan.entity';
import Transaksi from 'src/transaksi/transaksi.entity';
import Pihak from 'src/utang-piutang/pihak.entity';
import { ConfigModule } from '@nestjs/config';
import { Pimpinan } from 'src/perusahaan/pimpinan.entity';
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: process.env.MYSQL_DB_USERNAME,
      password: process.env.MYSQL_DB_PASSWORD,
      database: process.env.MYSQL_DB_NAME,
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
  providers: [
    SeedService,
    // PerusahaanService,
    // PersediaanService
  ],
})
export default class SeedModule {}
