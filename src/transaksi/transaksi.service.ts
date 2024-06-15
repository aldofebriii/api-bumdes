import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import Transaksi from './transaksi.entity';
import { Akun, ChartOfAccounts } from 'src/akun/akun.entity';
import {
  NewPenjualanDTO,
  NewTransaksiDTO,
  NewAkunDTO,
  NewPembelianDTO,
} from './transaksi.controller';
import { Perusahaan } from 'src/perusahaan/perusahaan.entity';
import HelperService from 'src/helper/helper.service';
import Persediaan from 'src/persediaan/persediaan.entity';
import PerusahaanService from 'src/perusahaan/perusahaan.service';
import PersediaanService from 'src/persediaan/persediaan.service';

export enum KeteranganTransaksi {
  PENJUALAN = 'penjualan',
  HPP = 'HPP',
}

enum NamaKodeAkun {
  KAS_TUNAI = '1.1.01.01',
  PIUTANG_USAHA = '1.1.03.01',
  PENDAPATAN_TIKET = '4.1.01.01',
  PERSEDIAAN_BARANG_DAGANGAN = '1.1.05.01',
  HARGA_POKOK_PENJUALAN = '5.1.01.01',
  UTANG_JK_PENDEK = '2.1.05.01',
}

type BarangTransaksi = { jumlah: number } & Persediaan;

@Injectable()
export default class TransaksiService {
  constructor(
    @InjectRepository(Transaksi)
    private transaksiRepo: Repository<Transaksi>,
    @InjectRepository(Akun)
    private akunRepo: Repository<Akun>,
    @InjectRepository(Perusahaan)
    private perusahaanRepo: Repository<Perusahaan>,
    @InjectRepository(ChartOfAccounts)
    private coaRepo: Repository<ChartOfAccounts>,
    @InjectRepository(Persediaan)
    private persediaanRepo: Repository<Persediaan>,

    private persediaanService: PersediaanService,
    private perusahaanService: PerusahaanService,
    private helperService: HelperService,
  ) {}

  async generateAkunPembelian(newPembelian: NewPembelianDTO) {
    let total = 0;
    const barangTerbeli: BarangTransaksi[] = [];
    for (const bt of newPembelian.barang_dibeli) {
      let persediaan: Persediaan;
      if (bt.new) {
        persediaan = await this.persediaanService.createOrEdit(bt.new);
        total += bt.new.kuantitas * persediaan.harga_beli_barang;
      } else {
        persediaan = await this.persediaanRepo.findOneBy({
          id: bt.id,
        });
        if (!persediaan)
          throw new HttpException(
            'TransaksiErrr: barang_persediaan_not_found',
            HttpStatus.NOT_FOUND,
          );
        persediaan.kuantitas += bt.jumlah;
        total += bt.jumlah * persediaan.harga_beli_barang;
        await this.persediaanRepo.save(persediaan);
      }
      barangTerbeli.push({ ...persediaan, jumlah: bt.jumlah });
    }
    let kodeKredit: string[] = [];
    switch (newPembelian.jenis_pembelian) {
      case 'tunai':
        kodeKredit = [NamaKodeAkun.KAS_TUNAI];
        break;
      case 'semi-tunai':
        kodeKredit = [NamaKodeAkun.KAS_TUNAI, NamaKodeAkun.UTANG_JK_PENDEK];
        break;
      case 'non-tunai':
        kodeKredit = [NamaKodeAkun.UTANG_JK_PENDEK];
        break;
    }
    const akunPembelian: NewAkunDTO[] = [];
    for (const kode of kodeKredit) {
      akunPembelian.push({
        posisi: 'kredit',
        jumlah:
          kode === NamaKodeAkun.KAS_TUNAI
            ? newPembelian.uang_muka
            : total - newPembelian.uang_muka,
        keterangan: newPembelian.keterangan,
        kode_akun: kode,
      });
    }
    akunPembelian.push({
      posisi: 'debit',
      jumlah: total,
      keterangan: newPembelian.keterangan,
      kode_akun: NamaKodeAkun.PERSEDIAAN_BARANG_DAGANGAN,
    });
    const transaksiPembelian: NewTransaksiDTO = {
      nomor: newPembelian.nomor,
      keterangan: newPembelian.keterangan,
      tanggal: newPembelian.tanggal,
      perusahaan_id: newPembelian.perusahaan_id,
      akun: akunPembelian,
    };
    const newTransaksi = await this.createNew([transaksiPembelian]);
    return newTransaksi;
  }

  async generateAkunPenjualan(newPenjualan: NewPenjualanDTO) {
    let kodeDebit: string[];
    switch (newPenjualan.jenis_penjualan) {
      case 'tunai':
        kodeDebit = [NamaKodeAkun.KAS_TUNAI];
        break;
      case 'semi-tunai':
        kodeDebit = [NamaKodeAkun.KAS_TUNAI, NamaKodeAkun.PIUTANG_USAHA];
        break;
      case 'non-tunai':
        kodeDebit = [NamaKodeAkun.PIUTANG_USAHA];
        break;
    }
    const akunPenjualan: NewAkunDTO[] = [];
    for (const kode of kodeDebit) {
      akunPenjualan.push({
        posisi: 'debit',
        jumlah:
          kode === NamaKodeAkun.KAS_TUNAI
            ? newPenjualan.jumlah_tunai
            : newPenjualan.jumlah_non_tunai,
        kode_akun: kode,
        keterangan: KeteranganTransaksi.PENJUALAN,
      });
    }
    akunPenjualan.push({
      posisi: 'kredit',
      jumlah: newPenjualan.jumlah_tunai + newPenjualan.jumlah_non_tunai,
      keterangan: KeteranganTransaksi.PENJUALAN,
      kode_akun: NamaKodeAkun.PENDAPATAN_TIKET,
    });
    const barangs: BarangTransaksi[] = [];
    for (const bt of newPenjualan.barang_terjual) {
      const barang = await this.persediaanRepo.findOneBy({ id: bt.id });
      if (!barang)
        throw new HttpException(
          'PenjualanError: Invalid Barang ID',
          HttpStatus.NOT_FOUND,
        );
      barangs.push({ ...barang, jumlah: bt.jumlah });
    }
    const map = new Map();
    map.set('total', 0);
    for (const barang of barangs) {
      barang.kuantitas--;
      map.set(
        'total',
        map.get('total') + barang.harga_beli_barang * barang.jumlah,
      );
    }
    this.persediaanRepo.save(barangs);
    const akunHpp = [];
    akunHpp.push(
      {
        posisi: 'debit',
        jumlah: map.get('total'),
        kode_akun: NamaKodeAkun.HARGA_POKOK_PENJUALAN,
        keterangan: KeteranganTransaksi.PENJUALAN,
      },
      {
        posisi: 'kredit',
        jumlah: map.get('total'),
        kode_akun: NamaKodeAkun.PERSEDIAAN_BARANG_DAGANGAN,
        keterangan: KeteranganTransaksi.PENJUALAN,
      },
    );
    return { akunPenjualan, akunHpp };
  }

  validasiAkun(newTransaksi: NewTransaksiDTO) {
    const map = new Map();
    map.set('debit', 0);
    map.set('kredit', 0);
    for (const akun of newTransaksi.akun) {
      map.set(akun.posisi, map.get(akun.posisi) + akun.jumlah);
    }
    if (map.get('debit') !== map.get('kredit'))
      throw new HttpException(
        'jumlah debit dan kredit tidak sesuai',
        HttpStatus.BAD_REQUEST,
      );
    return map.get('debit');
  }

  async createNew(newTransaksiList: NewTransaksiDTO[]) {
    const payload = [];
    for (const newTransaksi of newTransaksiList) {
      const totalTransaksi = this.validasiAkun(newTransaksi);
      const perusahaan = await this.perusahaanService.validasiPerusahaan(
        newTransaksi.perusahaan_id,
      );
      if (!perusahaan)
        throw new HttpException('not_found_perusahaan', HttpStatus.NOT_FOUND);
      //Penggalian data perusahaan;
      const transaksi: Transaksi = new Transaksi();
      transaksi.perusahaan = perusahaan;
      transaksi.jumlah = totalTransaksi;
      transaksi.keterangan = newTransaksi.keterangan;
      transaksi.nomor = newTransaksi.nomor;
      transaksi.tanggal = this.helperService.parsedIsoStringToDateTime(
        newTransaksi.tanggal,
      );
      await this.transaksiRepo.save(transaksi);

      const akunValue = [];
      let validCoa = true;
      for (const tA of newTransaksi.akun) {
        const foundCoa = await this.coaRepo.findOneBy({ kode: tA.kode_akun });
        if (!foundCoa) {
          validCoa = false;
          break;
        }
        akunValue.push({
          kode_akun: foundCoa,
          posisi: tA.posisi,
          jumlah: tA.jumlah,
          keterangan: tA.keterangan,
        });
      }
      transaksi.akun = akunValue;
      if (!validCoa) throw new HttpException('invalid coa', 400);
      await this.akunRepo.save(akunValue);
      await this.transaksiRepo.save(transaksi);
      payload.push(transaksi);
    }
    return payload;
  }
}
