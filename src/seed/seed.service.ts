import { Injectable } from '@nestjs/common';
import PersediaanService from 'src/persediaan/persediaan.service';
import PerusahaanService from 'src/perusahaan/perusahaan.service';
import { faker } from '@faker-js/faker';
import { NewPerusahaanDTO } from 'src/dtos/perusahaan/new-perusahaan.dto';
import { NewPersediaanDTO } from 'src/dtos/persediaan/new-persediaan.dto';
import { Perusahaan } from 'src/perusahaan/perusahaan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ChartOfAccounts } from 'src/akun/akun.entity';
import { Repository } from 'typeorm';
import { readFileSync } from 'fs';
import * as path from 'path';

@Injectable()
export class SeedService {
  // private fakePerusahaan: Perusahaan[] = [];
  // private fakePersediaan = [];
  constructor(
    @InjectRepository(ChartOfAccounts)
    private coaRepo: Repository<ChartOfAccounts>,
    // private perusahaanService: PerusahaanService,
    // private persediaanService: PersediaanService,
  ) {}

  // fakerPerusahaan(): NewPerusahaanDTO {
  //   return {
  //     nama: faker.company.name(),
  //     email: faker.internet.email(),
  //     alamat: faker.location.streetAddress(),
  //     pimpinan.nama: faker.person.fullName(),
  //     nomor_telepon: faker.phone.number(),
  //     alamat_pimpinan: faker.location.streetAddress(),
  //   };
  // }

  // fakerPersediaan: () => NewPersediaanDTO = () => {
  //   const randomBool = Math.random() >= 0.5;
  //   return {
  //     nama_barang: faker.vehicle.vehicle(),
  //     harga_beli_barang: faker.number.float({
  //       min: 1000,
  //       max: 100_000,
  //       fractionDigits: 2,
  //     }),
  //     kuantitas: faker.number.int({ min: 100, max: 10000 }),
  //     sku: faker.finance.accountName(),
  //     perusahaan_id: randomBool
  //       ? this.fakePerusahaan[0].id
  //       : this.fakePerusahaan[1].id,
  //   };
  // };

  async generateCoA() {
    const rawCoa = JSON.parse(
      readFileSync(path.join(__dirname, 'coa.json'), 'utf-8'),
    );
    await this.coaRepo.save(rawCoa);
  }

  // async generatePerusahaan() {
  //   const multipleNewPerusahaan: NewPerusahaanDTO[] = faker.helpers.multiple(
  //     this.fakerPerusahaan,
  //     {
  //       count: 2, ///Hanya ngegenerate dua perusahaan
  //     },
  //   );

  //   for (const perusahaan of multipleNewPerusahaan) {
  //     const newPerusahaan = await this.perusahaanService.createOrEdit(
  //       perusahaan,
  //     );
  //     this.fakePerusahaan.push(newPerusahaan);
  //   }
  // }

  // generatePersediaan = async () => {
  //   if (this.fakePerusahaan.length === 0)
  //     throw new Error(
  //       'SeederError: Perusahaan generator must initizalize first',
  //     );
  //   const multipleNewPersediaan: NewPersediaanDTO[] = faker.helpers.multiple(
  //     this.fakerPersediaan,
  //     { count: 20 },
  //   );
  //   for (const persediaan of multipleNewPersediaan) {
  //     const newPersediaan = await this.persediaanService.createOrEdit(
  //       persediaan,
  //     );
  //     this.fakePersediaan.push(newPersediaan);
  //   }
  // };
}

export default SeedService;
