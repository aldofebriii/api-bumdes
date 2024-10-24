import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { NewPerusahaanDTO } from 'src/dtos/perusahaan/new-perusahaan.dto';
import { Perusahaan, Pimpinan } from './perusahaan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

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
    perusahaan.pimpinan = pimpinan;
    /**
     * async process to hash password
     */
    bcrypt.genSalt(8, (err, salt) => {
      if (err) {
        return console.error(err.message);
      }
      bcrypt
        .hash(newPerusahaan.kata_sandi, salt)
        .then((value) => {
          perusahaan.kata_sandi = value;
          this.perusahaanRepo.save(perusahaan);
        })
        .catch((err) => console.error(err.message));
    });

    return perusahaan;
  }

  validasiPerusahaan(perusahaanId: number) {
    return this.perusahaanRepo.findOneBy({ id: perusahaanId });
  }

  findOneByEmail(email: string) {
    return this.perusahaanRepo.findOneBy({ email });
  }

  findOneById(id: number) {
    return this.perusahaanRepo.findOneBy({ id });
  }

  async getProfile(id: number) {
    const perusahaan = await this.findOneById(id);
    const pimpinan = await this.pimpinanRepo.findOneBy({ perusahaan: { id } })

    return {
      perusahaan: {
        nama: perusahaan.nama,
        email: perusahaan.email,
        alamat: perusahaan.alamat,
      },
      pimpinan : {
        nama: pimpinan.nama,
        alamat: pimpinan.alamat
      }
    }
  }
}
