import {
  IsNumber,
  IsOptional,
  IsString,
  ValidatorConstraintInterface,
  Validate,
  ValidatorConstraint,
} from 'class-validator';

@ValidatorConstraint()
export class IsDebitOrKreditConstraint implements ValidatorConstraintInterface {
  validate(text: string): boolean {
    return text === 'debit' || text === 'kredit';
  }
  defaultMessage(): string {
    return 'Kode Akun harus memiliki value debit ataupun kredit (lowercase)';
  }
}

export function IsDebitOrKredit() {
  return Validate(IsDebitOrKreditConstraint);
}

export class NewAkunDTO {
  @IsNumber()
  @IsOptional()
  id?: number;
  @IsString()
  kode_akun: string;
  @IsDebitOrKredit()
  posisi: 'debit' | 'kredit';
  @IsNumber()
  jumlah: number;
  @IsString()
  keterangan: string;
}
