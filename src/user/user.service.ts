import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { NewUserDTO } from 'src/dtos/user/new-user.dto';
import { User } from './user.entity';
import { Perusahaan, Pimpinan } from 'src/perusahaan/perusahaan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export default class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Perusahaan)
    private perusahaanRepo: Repository<Perusahaan>,
    @InjectRepository(Pimpinan)
    private pimpinanRepo: Repository<Pimpinan>,
  ) {}

  async create(
    newUser: NewUserDTO,
    userId?: number,
  ) {
    let user: User;
    if (userId) {
      const currentAccount = await this.userRepo.findOne({ relations: { perusahaan: true }, where: { id: userId } });
      if (!currentAccount) throw new HttpException("Pengguna tidak ditemukan", 404);
      
      if (currentAccount.roles !== "admin") throw new HttpException("Pengguna bukan seorang admin!", 403);

      user = new User();
      user.nama = newUser.nama;
      user.email = newUser.email;
      user.roles = "user";
      user.perusahaan = currentAccount.perusahaan;
      
    } else {
      let pimpinan        = new Pimpinan();
      pimpinan.nama       = newUser.perusahaan.pimpinan.nama;
      pimpinan.alamat     = newUser.perusahaan.pimpinan.alamat;
      pimpinan            = await this.pimpinanRepo.save(pimpinan);

      let perusahaan             = new Perusahaan();
      perusahaan.nama            = newUser.perusahaan.nama;
      perusahaan.email           = newUser.perusahaan.email;
      perusahaan.nomor_telepon   = newUser.perusahaan.nomor_telepon;
      perusahaan.alamat          = newUser.perusahaan.alamat;
      perusahaan.pimpinan        = pimpinan;
      perusahaan                 = await this.perusahaanRepo.save(perusahaan);

      user = new User();
      user.nama = newUser.nama;
      user.email = newUser.email;
      user.roles = "admin";
      user.perusahaan = perusahaan;
    } 
    
    /**
     * async process to hash password
     */
    bcrypt.genSalt(8, (err, salt) => {
      if (err) {
        return console.error(err.message);
      }
      bcrypt
        .hash(newUser.kata_sandi, salt)
        .then((value) => {
          user.kata_sandi = value;
          this.userRepo.save(user);
        })
        .catch((err) => console.error(err.message));
    });

    return user;
  }

  validasiPerusahaan(userId: number) {
    return this.userRepo.findOneBy({ id: userId });
  }

  findOneByEmail(email: string) {
    return this.userRepo.findOneBy({ email });
  }

  findOneById(id: number) {
    return this.userRepo.findOne({relations: { perusahaan: { pimpinan: true } }, where: { id }});
  }

  async getAnggota(id: number) { 
    return this.userRepo.find({
      where: {
        perusahaan: {
          id: id
        }
      }
    })
  }

  async getProfile(id: number) {
    const user = await this.findOneById(id);

    return {
      user: {
        nama: user.nama,
        email: user.email,
        roles: user.roles,
        perusahaan: {
          nama: user.perusahaan.nama,
          alamat: user.perusahaan.alamat,
          email: user.perusahaan.email,
          nomor_telepon: user.perusahaan.nomor_telepon,
          pimpinan: {
            nama: user.perusahaan.pimpinan.nama,
            alamat: user.perusahaan.pimpinan.alamat
          }
        }
      }
    }
  }
}
