import { IsDateString, IsNumber, IsString } from 'class-validator';

export class NewModalDTO {
  @IsDateString()
  tanggal: string;
  @IsNumber()
  nomor: number;
  @IsString()
  keterangan: string;
  @IsString()
  kode_akun: string;
  @IsNumber()
  jumlah: number;
}
