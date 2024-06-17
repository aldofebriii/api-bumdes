import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Pihak from './pihak.entity';
import { Repository } from 'typeorm';
import { NewPihakDTO } from './pihak.controller';
import HelperService from 'src/helper/helper.service';
import Transaksi from 'src/transaksi/transaksi.entity';

@Injectable()
export default class PihakService {
  constructor(
    @InjectRepository(Pihak) private pihakRepo: Repository<Pihak>,
    private helperService: HelperService,
  ) {}
  async createNew(newPihak: NewPihakDTO, transaksi: Transaksi) {
    const pihak = new Pihak();
    pihak.nama = newPihak.nama;
    pihak.jatuh_tempo_awal = newPihak.jatuh_tempo_awal;
    pihak.jatuh_tempo_akhir = newPihak.jatuh_tempo_akhir;
    pihak.status = newPihak.status;
    pihak.jumlah = newPihak.jumlah;
    pihak.transaksi = transaksi;
    await this.pihakRepo.save(pihak);
    return pihak;
  }
}
