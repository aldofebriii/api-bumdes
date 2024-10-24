import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Anggota } from "./anggota.entity";
import { NewAnggotaDTO } from "src/dtos/anggota/new-anggota.dto";
import { CurrentPerusahaanProvider } from "src/auth/current-perusahaan.service";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AnggotaService {
    constructor(
        @InjectRepository(Anggota)
        private anggotaRepo: Repository<Anggota>,
        private perusahaanProvider: CurrentPerusahaanProvider,
    ) {}

    async createOrEdit(
        newAnggota: NewAnggotaDTO,
        anggotaId?: number,
    ) {
        let anggota: Anggota;
        if(anggotaId) {
            anggota = await this.anggotaRepo.findOneBy({ id: anggotaId });
            if(!anggota)
                throw new HttpException('not_found', HttpStatus.NOT_FOUND);
        } else {
            anggota = new Anggota();
        }
        
        anggota.perusahaan    = this.perusahaanProvider.getPerusahaan();
        anggota.nama          = newAnggota.nama;
        anggota.email         = newAnggota.email;
        anggota.nomor_telepon = newAnggota.no_telepon;
        anggota.roles         = newAnggota.roles;
        
        bcrypt.genSalt(8, (err, salt) => {
            if (err) {
                return console.error(err.message);
            }
            bcrypt
                .hash(newAnggota.kata_sandi, salt)
                .then((value) => {
                    anggota.kata_sandi = value;
                    this.anggotaRepo.save(anggota);
                })
                .catch((err) => console.error(err.message));
        });

        return anggota;
    }

    validasiAnggota(anggotaId: number) {
        return this.anggotaRepo.findOneBy({ id: anggotaId });
    }

    findOneByEmail(email: string) {
        return this.anggotaRepo.findOneBy({ email });
    }

    findOneById (id: number) {
        return this.anggotaRepo.findOneBy({ id });
    }

    getAnggota (perusahaanId: number) {
        return this.anggotaRepo.find({
            where: {
                perusahaan: { id: perusahaanId }
            }
        });
    }
}