import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { NewPersediaanDTO } from './persediaan.controller';
import { Repository } from 'typeorm';
import Persediaan from './persediaan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import PerusahaanService from 'src/perusahaan/perusahaan.service';

@Injectable()
export default class PersediaanService {
  constructor(
    @InjectRepository(Persediaan)
    private persediaanRepo: Repository<Persediaan>,
    private perusahaanService: PerusahaanService,
  ) {}

  async createOrEdit(newPersediaan: NewPersediaanDTO, persediaanId?: number) {
    const perusahaan = await this.perusahaanService.validasiPerusahaan(
      newPersediaan.perusahaan_id,
    );
    if (!perusahaan)
      throw new HttpException('invalid_perusahaan_id', HttpStatus.BAD_REQUEST);

    let persediaan: Persediaan;
    if (persediaanId) {
      persediaan = await this.persediaanRepo.findOneBy({ id: persediaanId });
    } else {
      persediaan = new Persediaan();
    }
    persediaan.perusahaan = perusahaan;
    persediaan.sku = newPersediaan.sku;
    persediaan.nama_barang = newPersediaan.nama_barang;
    persediaan.kuantitas = newPersediaan.kuantitas;
    persediaan.harga_beli_barang = newPersediaan.harga_beli_barang;

    await this.persediaanRepo.save(persediaan);
    return persediaan;
  }
}
