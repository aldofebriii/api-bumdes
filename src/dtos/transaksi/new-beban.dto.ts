import {
  IsDateString,
  IsNumber,
  IsString,
  NotEquals,
  ValidateIf,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
} from 'class-validator';
import { IsValidJenisTransaksi, JenisTransaksi } from './new-transaksi.dto';

@ValidatorConstraint()
export class IsGreaterThanConstrain implements ValidatorConstraintInterface {
  validate(value: number, args?: ValidationArguments): boolean {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value >= relatedValue;
  }
}

export function IsGreaterThan(property: string, opt?: ValidationOptions) {
  return Validate(IsGreaterThanConstrain, [property], opt);
}

export class NewBebanDTO {
  @IsString()
  kode_akun: string;

  @IsDateString()
  tanggal: string;

  @IsNumber()
  nomor: number;

  @IsString()
  keterangan: string;

  @IsValidJenisTransaksi()
  jenis_transaksi: JenisTransaksi;

  @NotEquals(0, {
    message:
      'jumlah non tunai tidak dapat bernilai 0 (nol) jika jenis_transaksi memiliki nilai non-tunai atau semi-tunai',
  })
  @ValidateIf(
    (o) =>
      o.jenis_transaksi === 'non-tunai' || o.jenis_transaksi === 'semi-tunai',
  )
  @IsNumber()
  uang_muka: number;

  @IsGreaterThan('uang_muka', {
    message: 'Jumlah harus memiliki nilai yang lebih besar dari uang muka',
  })
  @ValidateIf(
    (o) =>
      o.jenis_transaksi === 'non-tunai' || o.jenis_transaksi === 'semi-tunai',
  )
  @NotEquals(0)
  @IsNumber()
  jumlah: number;
}
