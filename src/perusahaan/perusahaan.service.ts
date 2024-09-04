import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { NewPerusahaanDTO } from 'src/dtos/perusahaan/new-perusahaan.dto';
import { Perusahaan, Pimpinan } from './perusahaan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export default class PerusahaanService {
  constructor(
    @InjectRepository(Perusahaan)
    private perusahaanRepo: Repository<Perusahaan>,
    @InjectRepository(Pimpinan)
    private pimpinanRepo: Repository<Pimpinan>,
  ) {}

  async createOrEdit(
    newPerusahaan: NewPerusahaanDTO,
    perusahaanId?: number,
    pimpinanId?: number,
  ) {
    let perusahaan: Perusahaan;
    let pimpinan: Pimpinan;
    if (perusahaanId) {
      perusahaan = await this.perusahaanRepo.findOneBy({ id: perusahaanId });
      if (!perusahaan)
        throw new HttpException('not_found', HttpStatus.NOT_FOUND);
    } else {
      perusahaan = new Perusahaan();
    }
    if (pimpinanId) {
      const pimpinanExists = await this.pimpinanRepo.findOneBy({
        id: pimpinanId,
      });
      if (!pimpinanExists)
        throw new HttpException(
          'PimpinanError: not found',
          HttpStatus.NOT_FOUND,
        );
      pimpinan = pimpinanExists;
    } else {
      pimpinan = new Pimpinan();
      pimpinan.nama = newPerusahaan.nama_pimpinan;
      pimpinan.alamat = newPerusahaan.alamat_pimpinan;
      await this.pimpinanRepo.save(pimpinan);
    }
    perusahaan.nama = newPerusahaan.nama;
    perusahaan.alamat = newPerusahaan.alamat;
    perusahaan.email = newPerusahaan.email;
    perusahaan.kata_sandi = newPerusahaan.kata_sandi;
    perusahaan.pimpinan = pimpinan;

    this.perusahaanRepo.save(perusahaan);
    return perusahaan;
  }

  async validasiPerusahaan(perusahaanId: number) {
    return await this.perusahaanRepo.findOneBy({ id: perusahaanId });
  }
}
