import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { NewPersediaanDTO } from 'src/dtos/persediaan/new-persediaan.dto';
import { Repository } from 'typeorm';
import Persediaan from './persediaan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import PerusahaanService from 'src/perusahaan/perusahaan.service';
import { CurrentPerusahaanProvider } from 'src/auth/current-perusahaan.service';

@Injectable()
export default class PersediaanService {
  constructor(
    @InjectRepository(Persediaan)
    private persediaanRepo: Repository<Persediaan>,
    private perusahaanProvider: CurrentPerusahaanProvider,
  ) {}

  async createOrEdit(newPersediaan: NewPersediaanDTO, persediaanId?: number) {
    let persediaan: Persediaan;
    if (persediaanId) {
      persediaan = await this.persediaanRepo.findOneBy({ id: persediaanId });
    } else {
      persediaan = new Persediaan();
    }
    persediaan.perusahaan = this.perusahaanProvider.getPerusahaan();
    persediaan.sku = newPersediaan.sku;
    persediaan.nama_barang = newPersediaan.nama_barang;
    persediaan.kuantitas = newPersediaan.kuantitas;
    persediaan.harga_beli_barang = newPersediaan.harga_beli_barang;

    await this.persediaanRepo.save(persediaan);
    return persediaan;
  }

  async fetchPersediaan() {
    const perusahaanId = this.perusahaanProvider.getPerusahaan().id;
    const persediaan = await this.persediaanRepo.findBy({
      perusahaan: { id: perusahaanId },
    });
    return persediaan;
  }
}
