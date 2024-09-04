import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
  ValidatorConstraintInterface,
  ValidatorConstraint
} from 'class-validator';
import { NewAkunDTO } from './new-akun.dto';
import { Type } from 'class-transformer';
export type JenisTransaksi = 'tunai' | 'semi-tunai' | 'non-tunai';

@ValidatorConstraint()
export class JenisTransaksiConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    return ['tunai', 'semi-tunai', 'non-tunai'].indexOf(value) > -1;
  }

  defaultMessage(): string {
    return `Jenis Transaksi hanya tunai, semi tunai dan non tunai`;
  }
}

export function IsValidJenisTransaksi() {
  return Validate(JenisTransaksiConstraint);
}

export class NewTransaksiDTO {
  @IsNumber()
  @IsOptional()
  perusahaan_id: number;
  @IsDateString()
  tanggal: string; //String Formatted Date
  @IsNumber()
  nomor: number;
  @IsString()
  keterangan: string;
  @ValidateNested({ each: true })
  @Type(() => NewAkunDTO)
  akun: NewAkunDTO[];
}
