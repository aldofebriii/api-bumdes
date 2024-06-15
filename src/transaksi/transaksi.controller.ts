import { Controller, Body, Res, Post } from '@nestjs/common';
import TransaksiService from './transaksi.service';
import { Response } from 'express';
import { KeteranganTransaksi } from './transaksi.service';
import { NewPersediaanDTO } from 'src/persediaan/persediaan.controller';

export interface NewAkunDTO {
  id?: number;
  kode_akun: string;
  posisi: 'debit' | 'kredit';
  jumlah: number;
  keterangan: string;
}

export interface NewTransaksiDTO {
  perusahaan_id: number;
  tanggal: string; //String Formatted Date
  nomor: number;
  keterangan: string;
  akun: NewAkunDTO[];
}

export interface TransaksiBarangDTO {
  id: number;
  jumlah: number;
  new?: NewPersediaanDTO;
}

export interface NewPenjualanDTO {
  perusahaan_id: number;
  tanggal: string;
  nomor: number;
  keterangan: string;
  jenis_penjualan: 'tunai' | 'semi-tunai' | 'non-tunai';
  barang_terjual: TransaksiBarangDTO[];
  jumlah_tunai: number;
  jumlah_non_tunai: number;
}

export interface NewPembelianDTO {
  perusahaan_id: number;
  tanggal: string;
  nomor: number;
  keterangan: string;
  jenis_pembelian: 'tunai' | 'semi-tunai' | 'non-tunai';
  barang_dibeli: TransaksiBarangDTO[];
  uang_muka: number;
}

@Controller('transaksi')
export default class TransaksiController {
  constructor(private transaksiService: TransaksiService) {}

  @Post('pembelian')
  async pembelian(@Body() newPembelian: NewPembelianDTO, @Res() res: Response) {
    const akunPembelian = await this.transaksiService.generateAkunPembelian(
      newPembelian,
    );
    return res.status(201).json(akunPembelian);
  }

  @Post('penjualan')
  async penjualan(@Body() newPenjualan: NewPenjualanDTO, @Res() res: Response) {
    const { akunPenjualan, akunHpp } =
      await this.transaksiService.generateAkunPenjualan(newPenjualan);
    const transaksiPenjualan: NewTransaksiDTO = {
      nomor: newPenjualan.nomor,
      keterangan: KeteranganTransaksi.PENJUALAN,
      tanggal: newPenjualan.tanggal,
      perusahaan_id: newPenjualan.perusahaan_id,
      akun: akunPenjualan,
    };
    const transaksiHpp: NewTransaksiDTO = {
      nomor: newPenjualan.nomor,
      keterangan: KeteranganTransaksi.HPP,
      tanggal: newPenjualan.tanggal,
      perusahaan_id: newPenjualan.perusahaan_id,
      akun: akunHpp,
    };
    const transaksi = await this.transaksiService.createNew([
      transaksiPenjualan,
      transaksiHpp,
    ]);
    return res.status(201).json(transaksi);
  }

  @Post()
  async create(@Body() newTransaksi: NewTransaksiDTO, @Res() res: Response) {
    const transaksi = await this.transaksiService.createNew([newTransaksi]);
    return res.status(201).json(transaksi[0]);
  }
}
