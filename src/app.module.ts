import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Persediaan from './persediaan/persediaan.entity';
import { User } from './user/user.entity';
import Transaksi from './transaksi/transaksi.entity';
import { Akun, ChartOfAccounts } from './akun/akun.entity';
import UserModule from './user/user.module';
import TransaksiModule from './transaksi/transaksi.module';
import PersediaanModule from './persediaan/persediaan.module';
import Pihak from './utang-piutang/pihak.entity';
import PihakModule from './utang-piutang/pihak.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { Perusahaan } from './perusahaan/perusahaan.entity';
import PerusahaanModule from './perusahaan/perusahaan.module';
import { Pimpinan } from './perusahaan/pimpinan.entity';

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
        User,
        Transaksi,
        Persediaan,
        Akun,
        ChartOfAccounts,
        Pihak,
        Perusahaan
      ],
      synchronize: true,
      logging: 'all',
    }),
    UserModule,
    TransaksiModule,
    PersediaanModule,
    PihakModule,
    PerusahaanModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
