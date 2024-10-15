import { IsDateString, IsNumber, IsString } from 'class-validator';

export class NewModalDTO {
  @IsDateString()
  tanggal: string;
  @IsString()
  keterangan: string;
  @IsString()
  kode_akun: string;
  @IsNumber()
  jumlah: number;
}
