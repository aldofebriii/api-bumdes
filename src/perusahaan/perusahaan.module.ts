import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Perusahaan, Pimpinan } from './perusahaan.entity';
import PerusahaanController from './perusahaan.controller';
import PerusahaanService from './perusahaan.service';

@Module({
  controllers: [PerusahaanController],
  exports: [PerusahaanService, TypeOrmModule],
  imports: [TypeOrmModule.forFeature([Perusahaan, Pimpinan])],
  providers: [PerusahaanService],
})
export default class PerusahaanModule {}
