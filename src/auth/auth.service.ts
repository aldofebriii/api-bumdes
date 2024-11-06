import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import UserService from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}
  async signin(email: string, password: string) {
    const user = await this.userService.findOneByEmail(email);
    if(!user) throw new NotFoundException('pengguna tidak ditemukan');

    const valid = bcrypt.compareSync(password, user.kata_sandi);
    if(!valid) throw new HttpException('email / password salah', HttpStatus.UNAUTHORIZED);
    return user;
  }
}
