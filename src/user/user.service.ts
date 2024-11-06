import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { NewUserDTO } from 'src/dtos/user/new-user.dto';
import { User } from './user.entity';
import { Perusahaan } from 'src/perusahaan/perusahaan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import PerusahaanService from 'src/perusahaan/perusahaan.service';

@Injectable()
export default class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Perusahaan)
    private perusahaanRepo: Repository<Perusahaan>,
  ) {}

  async createOrEdit(
    newUser: NewUserDTO,
    userId?: number,
  ) {
    let user: User;
    if (userId) {
      user = await this.userRepo.findOneBy({ id: userId });
      if (!user)
        throw new HttpException('not_found', HttpStatus.NOT_FOUND);
    } else {
      user = new User();
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
    return this.userRepo.findOneBy({ id });
  }

  async getProfile(id: number) {
    const user = await this.findOneById(id);

    return {
      profile: {
        nama: user.nama,
        email: user.email,
        roles: user.roles
      },

      perusahaan: {
        nama: user.perusahaan.nama,
        alamat: user.perusahaan.alamat,
        nomor_telepon: user.perusahaan.nomor_telepon,
        pimpinan: user.perusahaan.pimpinan
      }
    }
  }
}
