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
import PihakService from 'src/utang-piutang/pihak.service';
import { NewTransaksiDTO } from 'src/dtos/transaksi/new-transaksi.dto';
import { NewPenjualanDTO } from 'src/dtos/transaksi/new-penjualan.dto';
import { NewModalDTO } from 'src/dtos/transaksi/new-modal.dto';
import { NewUtangDTO } from 'src/dtos/transaksi/new-utang.dto';
import { NewBebanDTO } from 'src/dtos/transaksi/new-beban.dto';
import { NewPembelianDTO } from 'src/dtos/transaksi/new-pembelian.dto';

@Controller('transaksi')
export default class TransaksiController {
  private DUMMY_PERUSAHAAN_ID = 1;
  constructor(
    private transaksiService: TransaksiService,
    private pihakService: PihakService,
  ) {}

  @Get('akun-beban')
  async akunBeban(@Res() res: Response) {
    return res.status(200).json(await this.transaksiService.fetchAkunBeban());
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
    return res.status(201).json(transaksi);
  }
}
