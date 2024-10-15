import {
  IsDateString,
  IsNumber,
  IsString,
  Validate,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
export class DateIsGreaterThanConstraint
  implements ValidatorConstraintInterface
{
  validate(value: number, args?: ValidationArguments): boolean {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    const relatedDateValue = new Date(relatedValue).getTime();
    const dateValue = new Date(value).getTime();
    return dateValue >= relatedDateValue;
  }
}

export function DateIsGreaterThan(property: string, opt?: ValidationOptions) {
  return Validate(DateIsGreaterThanConstraint, [property], opt);
}

@ValidatorConstraint()
export class IsValidJangkaWaktuConstraint
  implements ValidatorConstraintInterface
{
  validate(value: string): boolean {
    return ['pendek', 'panjang'].indexOf(value) > -1;
  }

  defaultMessage(): string {
    return 'Jangka waktu hutang hanya terbagi atas pendek dan panjang';
  }
}

export function IsValidJangaWaktu() {
  return Validate(IsValidJangaWaktu);
}

export class NewUtangDTO {
  @IsValidJangaWaktu()
  jangka_waktu: 'pendek' | 'panjang';

  @IsDateString()
  tanggal: string;

  @IsString()
  keterangan: string;

  @IsString()
  nama_debitur: string;

  @IsNumber()
  jumlah: number;

  @IsDateString()
  jatuh_tempo_awal: string;

  @DateIsGreaterThan('jatuh_tempo_awal', {
    message: 'jatuh_tempo_akhir harus bernilai lebih dari awal',
  })
  @IsDateString()
  jatuh_tempo_akhir: string;
}
