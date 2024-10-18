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

export class DebiturTransaksi {
  @IsString()
  nama: string;
  @IsDateString()
  jatuh_tempo_awal: string;
  @IsDateString()
  jatuh_tempo_akhir: string;
}


export class NewPembelianDTO {
  @IsDateString()
  tanggal: string;
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

  @ValidateNested()
  @Type(() => DebiturTransaksi)
  @ValidateIf(
    (o) => o.jenis_transaksi === 'tunai' || o.jenis_transaksi === 'semi-tunai',
  )
  debitur?: DebiturTransaksi;
}
