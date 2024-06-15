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
    PerusahaanModule,
    TransaksiModule,
    PersediaanModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
