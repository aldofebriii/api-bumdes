import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import PerusahaanService from 'src/perusahaan/perusahaan.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private perusahaanService: PerusahaanService) {}
  async signin(email: string, password: string) {
    const perusahaan = await this.perusahaanService.findOneByEmail(email);
    if(!perusahaan) throw new NotFoundException('perusahanan tidak ditemukan');

    const valid = bcrypt.compareSync(password, perusahaan.kata_sandi);
    if(!valid) throw new HttpException('email / password salah', HttpStatus.UNAUTHORIZED);
    return perusahaan;
  }
}
