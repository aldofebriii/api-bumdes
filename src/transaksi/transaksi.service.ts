import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Transaksi from './transaksi.entity';
import { Akun, ChartOfAccounts } from 'src/akun/akun.entity';
import {
  NewPenjualanDTO,
  NewTransaksiDTO,
  NewAkunDTO,
  NewPembelianDTO,
  NewBebanDTO,
  JenisTransaksi,
  NewUtangDTO,
} from './transaksi.controller';
import { Perusahaan } from 'src/perusahaan/perusahaan.entity';
import HelperService from 'src/helper/helper.service';
import Persediaan from 'src/persediaan/persediaan.entity';
import PerusahaanService from 'src/perusahaan/perusahaan.service';
import PersediaanService from 'src/persediaan/persediaan.service';
import Debitur from 'src/utang/debitur.entity';

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
  UTANG_JK_PANJANG = '2.2.02.01',
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
    @InjectRepository(Debitur)
    private debiturRepo: Repository<Debitur>,

    private persediaanService: PersediaanService,
    private perusahaanService: PerusahaanService,
    private helperService: HelperService,
  ) {}

  private generateKodeAkun(
    posisi: 'debit' | 'kredit',
    jenisTransaksi: JenisTransaksi,
  ) {
    let listKode: string[] = [];
    const AkunNonTunai =
      posisi === 'debit'
        ? NamaKodeAkun.PIUTANG_USAHA
        : NamaKodeAkun.UTANG_JK_PENDEK;
    switch (jenisTransaksi) {
      case 'tunai':
        listKode = [NamaKodeAkun.KAS_TUNAI];
        break;
      case 'semi-tunai':
        listKode = [NamaKodeAkun.KAS_TUNAI, AkunNonTunai];
        break;
      case 'non-tunai':
        listKode = [AkunNonTunai];
        break;
    }
    return listKode;
  }

  async generateAkunUtang(newUtang: NewUtangDTO) {
    const debitur = new Debitur();
    debitur.nama_debitur = newUtang.nama_debitur;
    debitur.jatuh_tempo_awal = newUtang.jatuh_tempo_awal;
    debitur.jatuh_tempo_akhir = newUtang.jatuh_tempo_akhir;

    const akunUtang: NewAkunDTO[] = [
      {
        posisi: 'debit',
        kode_akun: NamaKodeAkun.KAS_TUNAI,
        jumlah: newUtang.jumlah,
        keterangan: newUtang.keterangan,
      },
    ];
    let kodeAkun: string;
    if (newUtang.jangka_waktu === 'pendek') {
      kodeAkun = NamaKodeAkun.UTANG_JK_PENDEK;
    } else {
      kodeAkun = NamaKodeAkun.UTANG_JK_PANJANG;
    }
    akunUtang.push({
      posisi: 'kredit',
      kode_akun: kodeAkun,
      jumlah: newUtang.jumlah,
      keterangan: newUtang.keterangan,
    });
    const utang = await this.createNew([
      {
        akun: akunUtang,
        perusahaan_id: newUtang.perusahaan_id,
        keterangan: newUtang.keterangan,
        nomor: newUtang.nomor,
        tanggal: newUtang.tanggal,
      },
    ]);
    debitur.transaksi = utang;
    await this.debiturRepo.save(debitur);
    return utang;
  }

  async generateAkunPembebanan(newBeban: NewBebanDTO) {
    const kodeKredit = this.generateKodeAkun(
      'kredit',
      newBeban.jenis_transaksi,
    );
    const akunPembebanan: NewAkunDTO[] = [
      {
        posisi: 'debit',
        kode_akun: newBeban.kode_akun,
        jumlah: newBeban.jumlah,
        keterangan: newBeban.keterangan,
      },
    ];
    for (const kode of kodeKredit) {
      akunPembebanan.push({
        kode_akun: kode,
        keterangan: newBeban.keterangan,
        posisi: 'kredit',
        jumlah:
          NamaKodeAkun.KAS_TUNAI === kode
            ? newBeban.uang_muka
            : newBeban.jumlah - newBeban.uang_muka,
      });
    }
    const pembebanan = await this.createNew([
      {
        akun: akunPembebanan,
        keterangan: newBeban.keterangan,
        nomor: newBeban.nomor,
        perusahaan_id: newBeban.perusahaan_id,
        tanggal: newBeban.tanggal,
      },
    ]);
    return pembebanan;
  }

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
    const kodeKredit = this.generateKodeAkun(
      'kredit',
      newPembelian.jenis_transaksi,
    );
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
    const kodeDebit = this.generateKodeAkun(
      'debit',
      newPenjualan.jenis_transaksi,
    );
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
    let total = 0;
    for (const barang of barangs) {
      if (barang.kuantitas < barang.jumlah)
        throw new HttpException(
          'TransaksiError: kuantitas barang tidak cukup',
          HttpStatus.NOT_ACCEPTABLE,
        );
      barang.kuantitas -= barang.jumlah;
      total += barang.harga_beli_barang * barang.jumlah;
    }
    this.persediaanRepo.save(barangs);
    const akunHpp = [];
    akunHpp.push(
      {
        posisi: 'debit',
        jumlah: total,
        kode_akun: NamaKodeAkun.HARGA_POKOK_PENJUALAN,
        keterangan: KeteranganTransaksi.PENJUALAN,
      },
      {
        posisi: 'kredit',
        jumlah: total,
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
    return payload.length === 1 ? payload[0] : payload;
  }
}
