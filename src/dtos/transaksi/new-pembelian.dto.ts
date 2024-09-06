import {
  IsDateString,
  IsNumber,
  IsString,
  NotEquals,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { IsValidJenisTransaksi, JenisTransaksi } from './new-transaksi.dto';
import { TransaksiBarangDTO } from '../persediaan/transaksi-barang.dto';
import { Type } from 'class-transformer';

export class NewPembelianDTO {
  @IsNumber()
  perusahaan_id: number;
  @IsDateString()
  tanggal: string;
  @IsNumber()
  nomor: number;
  @IsString()
  keterangan: string;
  @IsValidJenisTransaksi()
  jenis_transaksi: JenisTransaksi;
  @ValidateNested({ each: true })
  @Type(() => TransaksiBarangDTO)
  barang_dibeli: TransaksiBarangDTO[];

  @NotEquals(0, {
    message: 'Transaksi selain tunai wajib memiliki uang muka',
  })
  @ValidateIf((o) => o.jenis_transaksi !== 'tunai')
  @IsNumber()
  uang_muka: number;
}
