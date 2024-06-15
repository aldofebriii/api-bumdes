import { Module } from '@nestjs/common';
import PerusahaanModule from 'src/perusahaan/perusahaan.module';
import PerusahaanService from 'src/perusahaan/perusahaan.service';
import PersediaanService from './persediaan.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Persediaan from './persediaan.entity';
import PersediaanController from './persediaan.controller';

@Module({
  controllers: [PersediaanController],
  imports: [PerusahaanModule, TypeOrmModule.forFeature([Persediaan])],
  providers: [PerusahaanService, PersediaanService],
})
export default class PersediaanModule {}
