import { IsNumber, IsString, NotEquals } from 'class-validator';

export class NewPersediaanDTO {
  @IsString()
  sku: string;
  @IsString()
  nama_barang: string;
  @NotEquals(0)
  @IsNumber()
  kuantitas: number;
  @IsNumber()
  harga_beli_barang: number;
  @IsNumber()
  perusahaan_id: number;
}
