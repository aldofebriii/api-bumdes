import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Perusahaan } from "./perusahaan.entity";
import { NewPerusahaanDTO } from "src/dtos/perusahaan/new-perusahaan.dto";

@Injectable()
export default class PerusahaanService {
    constructor(
        @InjectRepository(Perusahaan)
        private perusahaanRepo: Repository<Perusahaan>
    ) {}

    async createOrEdit(
        newPerusahaan: NewPerusahaanDTO,
        perusahaanId?: number,
    ) {
        let perusahaan: Perusahaan;
        if(perusahaanId) {
            perusahaan = await this.perusahaanRepo.findOneBy({ id: perusahaanId });
            if(!perusahaan)
                throw new HttpException('not_found', HttpStatus.NOT_FOUND);
        } else {
            perusahaan = new Perusahaan();
        }
        
        perusahaan.nama            = newPerusahaan.nama_perusahaan;
        perusahaan.alamat          = newPerusahaan.alamat_perusahaan;
        perusahaan.nomor_telepon   = newPerusahaan.nomor_telepon;
        perusahaan.pimpinan.nama   = newPerusahaan.nama_pimpinan;
        perusahaan.pimpinan.alamat = newPerusahaan.alamat_pimpinan;
        
        return perusahaan;
    }

    validasiPerusahaan(perusahaanId: number) {
        return this.perusahaanRepo.findOneBy({ id: perusahaanId });
    }

    findOneByNama(nama: string) {
        return this.perusahaanRepo.findOneBy({ nama });
    }

    findOneById (id: number) {
        return this.perusahaanRepo.findOneBy({ id });
    }

    getAnggota (perusahaanId: number) {
        return this.perusahaanRepo.find({
            where: {
                user: { perusahaan: { id: perusahaanId } }
            }
        });
    }
}