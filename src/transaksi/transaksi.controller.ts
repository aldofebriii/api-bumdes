import {
  Controller,
  Body,
  Res,
  Post,
  Get,
  Query,
  HttpException,
  Param,
} from '@nestjs/common';
import TransaksiService, { NamaKodeAkun } from './transaksi.service';
import { Response } from 'express';
import { KeteranganTransaksi } from './transaksi.service';
import { NewPersediaanDTO } from 'src/persediaan/persediaan.controller';
import PihakService from 'src/utang-piutang/pihak.service';

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
  kreditur?: {
    nama: string;
    jatuh_tempo_awal: string;
    jatuh_tempo_akhir: string;
  };
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

export interface NewModalDTO {
  perusahaan_id: number;
  tanggal: string;
  nomor: number;
  keterangan: string;
  kode_akun: string;
  jumlah: number;
}

@Controller('transaksi')
export default class TransaksiController {
  private DUMMY_PERUSAHAAN_ID = 1;
  constructor(
    private transaksiService: TransaksiService,
    private pihakService: PihakService,
  ) {}

  @Get('akun-beban')
  async akunBeban(@Res() res: Response) {
    return res
      .status(200)
      .json(
        await this.transaksiService.fetchAkunBeban()
      ) 
  }

  @Get('buku-besar/:kode_akun')
  async akunBukuBesar(
    @Param('kode_akun') kodeAkun: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Res() res: Response,
  ) {
    return res
      .status(200)
      .json(
        await this.transaksiService.detailBukuBesar(
          this.DUMMY_PERUSAHAAN_ID,
          kodeAkun,
          { start: startDate, end: endDate },
        ),
      );
  }

  @Get('/neraca-saldo')
  async neracaSaldo(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Res() res: Response,
  ) {
    return res.status(200).json(
      await this.transaksiService.getNeracaSaldo(this.DUMMY_PERUSAHAAN_ID, {
        start: startDate,
        end: endDate,
      }),
    );
  }

  @Get('/ledger')
  async ledger(
    @Query('p') p: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Res() res: Response,
  ) {
    /**
     * @todo this need to be change based on user authencation.
     */
    const page = parseInt(p || '1');
    if (isNaN(page)) throw new HttpException('Invalid required query', 400);
    return res.status(200).json(
      await this.transaksiService.getAll(
        page,
        {
          akun: true,
          perusahaan: true,
        },
        {
          tanggal: 'DESC',
        },
        this.DUMMY_PERUSAHAAN_ID,
        {
          start: startDate,
          end: endDate,
        },
      ),
    );
  }
  @Post('modal')
  async modal(@Body() newModal: NewModalDTO, @Res() res: Response) {
    return res
      .status(201)
      .json(await this.transaksiService.generateTransaksiModal(newModal));
  }

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
  /**
   * @description Method for generating sells and also generated the person who is having a debt to company.
   * @returns Transaksi[] which 0 belong to sell and 1 belong tu HPP
   */
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
    if (newPenjualan.jenis_transaksi !== 'tunai') {
      const nominalPiutang = transaksiPenjualan.akun.filter(
        (a) => a.kode_akun === NamaKodeAkun.PIUTANG_USAHA,
      )[0];
      await this.pihakService.createNew(
        {
          nama: newPenjualan.kreditur.nama,
          jatuh_tempo_awal: newPenjualan.kreditur.jatuh_tempo_awal,
          jatuh_tempo_akhir: newPenjualan.kreditur.jatuh_tempo_akhir,
          status: 'kreditur',
          jumlah: nominalPiutang.jumlah,
        },
        transaksi[0], //Zero index belong to transaksiPenjualan
      );
    }
    return res.status(201).json(transaksi);
  }

  @Post()
  async create(@Body() newTransaksi: NewTransaksiDTO, @Res() res: Response) {
    const transaksi = await this.transaksiService.createNew([newTransaksi]);
    return res.status(201).json(transaksi[0]);
  }
}
