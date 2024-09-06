import { IsEmail, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class AuthPerusahaanDTO {
  @IsEmail()
  email: string;
  @IsString()
  kata_sandi: string;
}

export class CurrentPerusahaan {
  @Expose()
  id: number;
  @Expose()
  email: string;
  @Expose()
  nama: string;
}
