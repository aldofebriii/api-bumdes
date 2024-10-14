import { Type } from 'class-transformer';
import { TransaksiBarangDTO } from '../persediaan/transaksi-barang.dto';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  NotEquals,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { IsValidJenisTransaksi, JenisTransaksi } from './new-transaksi.dto';

export class KrediturTransaksi {
  @IsString()
  nama: string;
  @IsDateString()
  jatuh_tempo_awal: string;
  @IsDateString()
  jatuh_tempo_akhir: string;
}

export class NewPenjualanDTO {

  @IsDateString()
  tanggal: string;

  @IsString()
  keterangan: string;

  @IsValidJenisTransaksi()
  @IsString()
  jenis_transaksi: JenisTransaksi;

  @ValidateNested({ each: true })
  @Type(() => TransaksiBarangDTO)
  barang_terjual: TransaksiBarangDTO[];

  @NotEquals(0, {
    message:
      'jumlah tunai tidak dapat bernilai 0 (nol) jika jenis_transaksi memiliki nilai tunai atau semi-tunai',
  })
  @ValidateIf(
    (o) => o.jenis_transaksi === 'tunai' || o.jenis_transaksi === 'semi-tunai',
  )
  @IsNumber()
  jumlah_tunai: number;

  @NotEquals(0, {
    message:
      'jumlah non tunai tidak dapat bernilai 0 (nol) jika jenis_transaksi memiliki nilai non-tunai atau semi-tunai',
  })
  @ValidateIf(
    (o) =>
      o.jenis_transaksi === 'non-tunai' || o.jenis_transaksi === 'semi-tunai',
  )
  @IsNumber()
  jumlah_non_tunai: number;

  @ValidateNested()
  @Type(() => KrediturTransaksi)
  @ValidateIf(
    (o) => o.jenis_transaksi === 'tunai' || o.jenis_transaksi === 'semi-tunai',
  )
  kreditur?: KrediturTransaksi;
}
