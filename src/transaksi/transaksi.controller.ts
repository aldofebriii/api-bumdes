import {
  Controller,
  Body,
  Res,
  Post,
  Get,
  Query,
  HttpException,
  Param,
  UseGuards,
  UseInterceptors,
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
import { PerusahaanGuard } from 'src/guard/perusahaan.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Perusahaan } from 'src/perusahaan/perusahaan.entity';
import { CurrentUserInterceptor } from 'src/interceptors/current-user.interceptor';

@UseInterceptors(CurrentUserInterceptor)
@UseGuards(PerusahaanGuard)
@Controller('transaksi')
export default class TransaksiController {
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
      );
  }

  @Get()
  fetchTransaksi(
    @Param('kode_akun') kodeAkun: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.transaksiService.getAll(
      1,
      { akun: true, perusahaan: false },
      { tanggal: 'ASC' },
      { start: startDate, end: endDate },
    );
  }

  @Get('buku-besar/:kode_akun')
  akunBukuBesar(
    /**
     * @todo harus ada validasi terhadap param menggunakan pipe baik start_date maupun end_date
     */
    @Param('kode_akun') kodeAkun: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.transaksiService.detailBukuBesar(kodeAkun, {
      start: startDate,
      end: endDate,
    });
  }

  @Get('neraca-saldo')
  neracaSaldo(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.transaksiService.getNeracaSaldo({
      start: startDate,
      end: endDate,
    });
  }

  @Get('ledger')
  ledger(
    @Query('p') p: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @CurrentUser() user: Perusahaan,
  ) {
    console.log(user);
    /**
     * @todo this need to be change based on user authencation.
     */
    const page = parseInt(p || '1');
    if (isNaN(page)) throw new HttpException('Invalid required query', 400);
    return this.transaksiService.getAll(
      page,
      {
        akun: true,
        perusahaan: true,
      },
      {
        tanggal: 'DESC',
      },
      {
        start: startDate,
        end: endDate,
      },
    );
  }
  @Post('modal')
  modal(@Body() newModal: NewModalDTO) {
    return this.transaksiService.generateTransaksiModal(newModal);
  }

  @Post('utang')
  utang(@Body() newUtang: NewUtangDTO) {
    return this.transaksiService.generateAkunUtang(newUtang);
  }

  @Post('beban-operasional')
  pembebanan(@Body() newBeban: NewBebanDTO) {
    return this.transaksiService.generateAkunPembebanan(newBeban);
  }

  @Post('pembelian')
  pembelian(@Body() newPembelian: NewPembelianDTO) {
    return this.transaksiService.generateAkunPembelian(newPembelian);
  }
  /**
   * @description Method for generating sells and also generated the person who is having a debt to company.
   * @returns Transaksi[] which 0 belong to sell and 1 belong tu HPP
   */
  @Post('penjualan')
  async penjualan(@Body() newPenjualan: NewPenjualanDTO) {
    const { akunPenjualan, akunHpp } =
      await this.transaksiService.generateAkunPenjualan(newPenjualan);

    const transaksiPenjualan: NewTransaksiDTO = {
      keterangan: KeteranganTransaksi.PENJUALAN,
      tanggal: newPenjualan.tanggal,
      akun: akunPenjualan,
    };

    const transaksiHpp: NewTransaksiDTO = {
      keterangan: KeteranganTransaksi.HPP,
      tanggal: newPenjualan.tanggal,
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
  create(
    @Body() newTransaksi: NewTransaksiDTO,
    @CurrentUser() user: Perusahaan,
  ) {
    return this.transaksiService.createNew([newTransaksi]);
  }
}
