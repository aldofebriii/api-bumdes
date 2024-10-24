import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Persediaan from './persediaan/persediaan.entity';
import { Perusahaan, Pimpinan } from './perusahaan/perusahaan.entity';
import Transaksi from './transaksi/transaksi.entity';
import { Akun, ChartOfAccounts } from './akun/akun.entity';
import PerusahaanModule from './perusahaan/perusahaan.module';
import TransaksiModule from './transaksi/transaksi.module';
import PersediaanModule from './persediaan/persediaan.module';
import Pihak from './utang-piutang/pihak.entity';
import PihakModule from './utang-piutang/pihak.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { Anggota } from './anggota/anggota.entity';
import AnggotaModule from './anggota/anggota.module';

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
        Transaksi,
        Persediaan,
        Akun,
        ChartOfAccounts,
        Pihak,
        Anggota
      ],
      synchronize: true,
      logging: 'all',
    }),
    PerusahaanModule,
    TransaksiModule,
    PersediaanModule,
    PihakModule,
    AnggotaModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
