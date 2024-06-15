import { Controller, Body, Res, Post } from '@nestjs/common';
import TransaksiService from './transaksi.service';
import { Response } from 'express';
import { KeteranganTransaksi } from './transaksi.service';
import { NewPersediaanDTO } from 'src/persediaan/persediaan.controller';

export type JenisTransaksi = 'tunai' | 'semi-tunai' | 'non-tunai';

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
  jenis_transaksi: JenisTransaksi;
  barang_terjual: TransaksiBarangDTO[];
  jumlah_tunai: number;
  jumlah_non_tunai: number;
}

export interface NewPembelianDTO {
  perusahaan_id: number;
  tanggal: string;
  nomor: number;
  keterangan: string;
  jenis_transaksi: JenisTransaksi;
  barang_dibeli: TransaksiBarangDTO[];
  uang_muka: number;
}

export interface NewBebanDTO {
  kode_akun: string;
  perusahaan_id: number;
  tanggal: string;
  nomor: number;
  keterangan: string;
  jenis_transaksi: JenisTransaksi;
  uang_muka: number;
  jumlah: number;
}

export interface NewUtangDTO {
  jangka_waktu: 'pendek' | 'panjang';
  perusahaan_id: number;
  tanggal: string;
  nomor: number;
  keterangan: string;
  nama_debitur: string;
  jumlah: number;
  jatuh_tempo_awal: string;
  jatuh_tempo_akhir: string;
}

@Controller('transaksi')
export default class TransaksiController {
  constructor(private transaksiService: TransaksiService) {}

  @Post('utang')
  async utang(@Body() newUtang: NewUtangDTO, @Res() res: Response) {
    return res
      .status(201)
      .json(await this.transaksiService.generateAkunUtang(newUtang));
  }

  @Post('beban-operasional')
  async pembebanan(@Body() newBeban: NewBebanDTO, @Res() res: Response) {
    return res
      .status(201)
      .json(await this.transaksiService.generateAkunPembebanan(newBeban));
  }

  @Post('pembelian')
  async pembelian(@Body() newPembelian: NewPembelianDTO, @Res() res: Response) {
    return res
      .status(201)
      .json(await this.transaksiService.generateAkunPembelian(newPembelian));
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
