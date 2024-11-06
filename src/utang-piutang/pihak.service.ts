import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Pihak from './pihak.entity';
import { Repository } from 'typeorm';
import { NewPihakDTO } from './pihak.controller';
import HelperService from 'src/helper/helper.service';
import Transaksi from 'src/transaksi/transaksi.entity';
import { CurrentUserProvider } from 'src/auth/current-user.service';

@Injectable()
export default class PihakService {
  constructor(
    @InjectRepository(Pihak) private pihakRepo: Repository<Pihak>,
    private helperService: HelperService,
    private userProvider: CurrentUserProvider,
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

  async updatePihak(id: number, jumlah: number) {
    const pihak = await this.pihakRepo.findBy({ id: id });
    await this.pihakRepo.save({
      id: id,
      jumlah: pihak.at(0).jumlah - jumlah
    });

    if ((await this.pihakRepo.find({ where:{ id:id } })).at(0).jumlah == 0) {
      await this.pihakRepo.delete({ id: id });
    }
  }

  async getPihak() {
    return this.pihakRepo.find({
      where: {
        transaksi: {
          perusahaan: {
            id: this.userProvider.getUser().perusahaan.id
          }
        }
      }
    })
  }

  async getPihakById(id: number) {
    return await this.pihakRepo.findBy({ id: id });
  }
}
