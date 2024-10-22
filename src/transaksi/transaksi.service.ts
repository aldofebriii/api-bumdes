import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Between, Like, Or, Repository } from 'typeorm';
import Transaksi from './transaksi.entity';
import { Akun, ChartOfAccounts } from 'src/akun/akun.entity';
import HelperService from 'src/helper/helper.service';
import Persediaan from 'src/persediaan/persediaan.entity';
import PersediaanService from 'src/persediaan/persediaan.service';
import PihakService from 'src/utang-piutang/pihak.service';
import {
  JenisTransaksi,
  NewTransaksiDTO,
} from 'src/dtos/transaksi/new-transaksi.dto';
import { NewModalDTO } from 'src/dtos/transaksi/new-modal.dto';
import { NewAkunDTO } from 'src/dtos/transaksi/new-akun.dto';
import { NewUtangDTO } from 'src/dtos/transaksi/new-utang.dto';
import { NewBebanDTO } from 'src/dtos/transaksi/new-beban.dto';
import { NewPembelianDTO } from 'src/dtos/transaksi/new-pembelian.dto';
import { NewPenjualanDTO } from 'src/dtos/transaksi/new-penjualan.dto';
import { CurrentPerusahaanProvider } from 'src/auth/current-perusahaan.service';
import { randomInt } from 'crypto';
import { NewPelunasanDTO } from 'src/dtos/transaksi/new-pelunasan.dto';

export enum KeteranganTransaksi {
  PENJUALAN = 'penjualan',
  HPP = 'HPP',
}

export enum NamaKodeAkun {
  KAS_TUNAI = '1.1.01.01',
  PIUTANG_USAHA = '1.1.03.01',
  PENDAPATAN_PENJUALAN_DAGANGAN = '4.2.01.91',
  PERSEDIAAN_BARANG_DAGANGAN = '1.1.05.01',
  HARGA_POKOK_PENJUALAN = '5.1.01.01',
  UTANG_JK_PENDEK = '2.1.05.01',
  UTANG_JK_PANJANG = '2.2.02.01',
  SETORAN_MODAL = '3.1.01.01',
}

type BarangTransaksi = { jumlah: number } & Persediaan;

@Injectable()
export default class TransaksiService {
  private PAGE_SIZE = 50;
  constructor(
    @InjectRepository(Transaksi)
    private transaksiRepo: Repository<Transaksi>,
    
    @InjectRepository(Akun)
    private akunRepo: Repository<Akun>,

    @InjectRepository(ChartOfAccounts)
    private coaRepo: Repository<ChartOfAccounts>,

    @InjectRepository(Persediaan)
    private persediaanRepo: Repository<Persediaan>,

    private persediaanService: PersediaanService,
    private helperService: HelperService,
    private pihakService: PihakService,
    private perusahaanProvider: CurrentPerusahaanProvider,
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

  private dateFilter(date: { start: string; end: string }) {
    const dateQuery =
      this.helperService.validationYYYYMMDD(date.start) &&
      this.helperService.validationYYYYMMDD(date.end)
        ? And(Between(date.start, date.end))
        : undefined;
    return dateQuery;
  }

  async detailBukuBesar(
    kodeAkun: string,
    date: {
      start: string;
      end: string;
    },
  ) {
    return await this.akunRepo.find({
      relations: {
        transaksi: {
          perusahaan: true,
        },
        kode_akun: true,
      },
      where: {
        kode_akun: {
          kode: kodeAkun,
        },
        transaksi: {
          perusahaan: {
            id: this.perusahaanProvider.getPerusahaan().id,
          },
          tanggal: this.dateFilter(date),
        },
      },
    });
  }

  async fetchAkunBeban() {
    return await this.coaRepo.findBy({ kode: Like('6%') });
  }

  async fetchAkunModal() {
    return await this.coaRepo.findBy({ kode: Like('3%') });
  }

  async getNeracaSaldo(date: { start: string; end: string }) {
    const perusahaanId = this.perusahaanProvider.getPerusahaan().id;
    const dateFilter = this.dateFilter(date);
    let rekapanQuery = this.akunRepo
      .createQueryBuilder('akun')
      .leftJoinAndSelect('akun.kode_akun', 'coa')
      .leftJoinAndSelect(
        'akun.transaksi',
        'transaksi',
        'transaksi.perusahaanId = :perusahaanId',
        {
          perusahaanId,
        },
      )
      .where('transaksi.perusahaanId = :perusahaanId', { perusahaanId })
      .select(
        'akun.kodeAkunKode as kode, coa.nama_akun nama, akun.posisi, SUM(akun.jumlah) total',
      )
      .groupBy('akun.kodeAkunKode, akun.posisi');
    if (dateFilter) {
      rekapanQuery = rekapanQuery.where({
        transaksi: {
          tanggal: dateFilter,
        },
      });
    }

    return await rekapanQuery.getRawMany();
  }

  async getLabaRugi(date: { start: string; end: string }) {
    const pendapatanOperasional = await this.transaksiRepo.find({
      where: {
        perusahaan: {
          id: this.perusahaanProvider.getPerusahaan().id
        },
        akun: {
          kode_akun: {
            kode: Like("4.%"),
            nama_akun: Like("Pendapatan%"),
            posisi_normal: "kredit"
          }
        },
        tanggal: this.dateFilter(date)
      },
      cache: true
    });

    const hpp = await this.transaksiRepo.find({
      where: {
        perusahaan: {
          id: this.perusahaanProvider.getPerusahaan().id
        },
        akun: {
          kode_akun: {
            nama_akun: "Harga Pokok Penjualan Barang Dagangan",
            posisi_normal: "debit"
          }
        },
        tanggal: this.dateFilter(date)
      },
      cache: true
    });

    const bebanOperasional = await this.transaksiRepo.find({
      where: {
        perusahaan: {
          id: this.perusahaanProvider.getPerusahaan().id
        },
        akun: {
          kode_akun: {
            kode: Like("6.%"),
            nama_akun: Like("Beban%"),
            posisi_normal: "debit"
          }
        },
        tanggal: this.dateFilter(date)
      },
      cache: true
    });

    const pendapatanLain = await this.transaksiRepo.find({
      where: {
        perusahaan: {
          id: this.perusahaanProvider.getPerusahaan().id
        },
        akun: {
          kode_akun: {
            kode: Like("7.1.%"),
            nama_akun: Like("Pendapatan%"),
            posisi_normal: "kredit"
          }
        },
        tanggal: this.dateFilter(date)
      },
      cache: true
    });

    const bebanLain = await this.transaksiRepo.find({
      where: {
        perusahaan: {
          id: this.perusahaanProvider.getPerusahaan().id
        },
        akun: {
          kode_akun: {
            kode: Like("7.2%"),
            nama_akun: Like("Beban%"),
            posisi_normal: "debit"
          }
        },
        tanggal: this.dateFilter(date)
      },
      cache: true
    });
    
    const bebanPajak = await this.transaksiRepo.find({
      where: {
        perusahaan: {
          id: this.perusahaanProvider.getPerusahaan().id
        },
        akun: {
          kode_akun: {
            kode: Like("7.3%"),
            nama_akun: Like("Beban%"),
            posisi_normal: "debit"
          }
        },
        tanggal: this.dateFilter(date)
      },
      cache: true
    });

    return {
      pendapatan_operasional: pendapatanOperasional,
      hpp: hpp,
      beban_operasional: bebanOperasional,
      pendapatan_lain: pendapatanLain,
      beban_lain: bebanLain,
      beban_pajak: bebanPajak
    };
  }

  async getArusKas(date: { start: string; end: string }) {
    const perusahaanId = this.perusahaanProvider.getPerusahaan().id;
    return this.akunRepo.find({
      relations: {
        transaksi: {
          akun: { kode_akun: true }
        }
      },
      where: {
        transaksi: { perusahaan: { id: perusahaanId } },
        kode_akun: {
          nama_akun: "Kas Tunai"
        }
      },
      cache: true
    });
  }

  async getPerubahanEkuitas(date: { start: string; end: string }) {
    const penambahan_modal = await this.transaksiRepo.find({
      where: {
        perusahaan: {
          id: this.perusahaanProvider.getPerusahaan().id
        },
        akun: {
          kode_akun: Like("3.1.%"),
          posisi: 'kredit'
        }
      },
      cache: true
    });

    const penarikan_modal = await this.transaksiRepo.find({
      where: {
        akun: {
          kode_akun: Like("3.2.%"),
          posisi:"debit"
        }
      }
    });

    return {
      penambahan_modal: penambahan_modal,
      penarikan_modal: penarikan_modal
    }
  }

  async getAll(
    p: number,
    relations: {
      akun: boolean;
      perusahaan: boolean;
    },
    sort: {
      tanggal: 'ASC' | 'DESC';
    },
    date?: {
      start: string;
      end: string;
    },
  ) {
    const perusahaanId = this.perusahaanProvider.getPerusahaan().id;
    const transaksi = await this.transaksiRepo.find({
      relations: {
        akun: { kode_akun: true },
        perusahaan: relations.perusahaan,
      },
      take: this.PAGE_SIZE,
      skip: (p - 1) * this.PAGE_SIZE,
      order: {
        tanggal: sort.tanggal,
      },
      where: {
        perusahaan: {
          id: perusahaanId,
        },
        tanggal: this.dateFilter(date),
      },
    });
    return transaksi;
  }

  async generateTransaksiModal(newModal: NewModalDTO) {
    const akunModal: NewAkunDTO[] = [
      {
        kode_akun: NamaKodeAkun.KAS_TUNAI,
        posisi: 'debit',
        jumlah: newModal.jumlah,
        keterangan: newModal.keterangan,
      },
      {
        kode_akun: newModal.kode_akun,
        posisi: 'kredit',
        jumlah: newModal.jumlah,
        keterangan: newModal.keterangan,
      },
    ];

    return await this.createNew([
      {
        akun: akunModal,
        keterangan: newModal.keterangan,
        nomor: randomInt(999999),
        tanggal: newModal.tanggal,
      },
    ]);
  }

  async generateAkunUtang(newUtang: NewUtangDTO) {
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
        keterangan: newUtang.keterangan,
        nomor: randomInt(999999),
        tanggal: newUtang.tanggal,
      },
    ]);
    await this.pihakService.createNew(
      {
        nama: newUtang.nama_debitur,
        jatuh_tempo_awal: newUtang.jatuh_tempo_awal,
        jatuh_tempo_akhir: newUtang.jatuh_tempo_akhir,
        status: 'debitur',
        jumlah: utang.jumlah,
      },
      utang,
    );
    return utang;
  }

  async generateAkunPelunasan(newPelunasan: NewPelunasanDTO) {
    let kodeAkun: string;
    const pihak = await this.pihakService.getPihakById(newPelunasan.idPihak);
    const jumlah = newPelunasan.jumlah;

    if (newPelunasan.utang_piutang === "utang") {
      if (newPelunasan.jangka_waktu === "panjang") {
        kodeAkun = NamaKodeAkun.UTANG_JK_PANJANG;
      } else {
        kodeAkun = NamaKodeAkun.UTANG_JK_PENDEK;
      }
      const akunPembayaran: NewAkunDTO[] = [];
      akunPembayaran.push(
        {
          jumlah: jumlah,
          kode_akun: kodeAkun,
          posisi: "debit",
          keterangan: "Utang a.n."+pihak.at(0).nama
        }
      );
      akunPembayaran.push({
        jumlah: jumlah,
        kode_akun: NamaKodeAkun.KAS_TUNAI,
        posisi: "kredit",
        keterangan: "Pembayaran utang a.n."+pihak.at(0).nama
      });

      const pelunasan = await this.createNew([{
        akun: akunPembayaran,
        nomor: randomInt(999999),
        tanggal: newPelunasan.tanggal,
        keterangan: newPelunasan.keterangan
      }]);

      await this.pihakService.updatePihak(pihak.at(0).id, jumlah);
      return pelunasan;
    } else {
      const akunPembayaran: NewAkunDTO[] = [];
      kodeAkun = NamaKodeAkun.PIUTANG_USAHA;
      akunPembayaran.push(
        {
          jumlah: jumlah,
          kode_akun: kodeAkun,
          posisi: "kredit",
          keterangan: "Piutang a.n."+pihak.at(0).nama
        }
      );
      akunPembayaran.push({
        jumlah: jumlah,
        kode_akun: NamaKodeAkun.KAS_TUNAI,
        posisi: "debit",
        keterangan: "pembayaran piutang a.n."+pihak.at(0).nama
      });

      const pelunasan = await this.createNew([{
        akun: akunPembayaran,
        nomor: randomInt(999999),
        tanggal: newPelunasan.tanggal,
        keterangan: newPelunasan.keterangan
      }]);

      await this.pihakService.updatePihak(pihak.at(0).id, jumlah);
      return pelunasan;
    }
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
            ? newBeban.jumlah
            : newBeban.jumlah - newBeban.uang_muka,
      });
    }
    const pembebanan = await this.createNew([
      {
        akun: akunPembebanan,
        keterangan: newBeban.keterangan,
        nomor: randomInt(999999),
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
        console.log(total);
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
            ? total - newPembelian.uang_muka
            : newPembelian.uang_muka,
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
      nomor: randomInt(999999),
      keterangan: newPembelian.keterangan,
      tanggal: newPembelian.tanggal,
      akun: akunPembelian,
    };
    const newTransaksi = await this.createNew([transaksiPembelian]);
    if (newPembelian.jenis_transaksi !== 'tunai') {
      const nominalUtang = transaksiPembelian.akun.filter(
        (a) => a.kode_akun === NamaKodeAkun.UTANG_JK_PENDEK
      )[0];
      await this.pihakService.createNew(
        {
          nama: newPembelian.debitur.nama,
          jatuh_tempo_awal: newPembelian.debitur.jatuh_tempo_awal,
          jatuh_tempo_akhir: newPembelian.debitur.jatuh_tempo_akhir,
          status: 'debitur',
          jumlah: nominalUtang.jumlah,
        },
        newTransaksi
      );
    }
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
      kode_akun: NamaKodeAkun.PENDAPATAN_PENJUALAN_DAGANGAN,
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

  async createNew(newTransaksiList: NewTransaksiDTO[]): Promise<Transaksi> {
    const payload = [];
    for (const newTransaksi of newTransaksiList) {
      const totalTransaksi = this.validasiAkun(newTransaksi);
      const transaksi: Transaksi = new Transaksi();
      transaksi.perusahaan = this.perusahaanProvider.getPerusahaan();
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
