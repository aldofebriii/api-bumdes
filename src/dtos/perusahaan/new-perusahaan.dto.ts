import { IsString } from 'class-validator';

export class NewPerusahaanDTO {
  @IsString()
  nama: string;

  @IsString()
  alamat: string;

  @IsString()
  email: string;

  @IsString()
  kata_sandi: string;

  @IsString()
  nama_pimpinan: string;

  @IsString()
  alamat_pimpinan: string;
}
