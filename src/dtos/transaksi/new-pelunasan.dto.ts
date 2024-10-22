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

  @ValidatorConstraint()
  export class IsValidJUtangPiutangConstraint
    implements ValidatorConstraintInterface
  {
    validate(value: string): boolean {
      return ['utang', 'piutang'].indexOf(value) > -1;
    }
  
    defaultMessage(): string {
      return 'Utang Piutang hanya terbagi atas utang dan piutang';
    }
  }
  
  export function IsValidJangkaWaktu() {
    return Validate(IsValidJangkaWaktuConstraint);
  }

  export function IsValidUtangPiutang() {
    return Validate(IsValidJUtangPiutangConstraint);
  }
  
  export class NewPelunasanDTO {
    @IsValidJangkaWaktu()
    jangka_waktu: 'pendek' | 'panjang';

    @IsValidUtangPiutang()
    utang_piutang: 'utang' | 'piutang';

    @IsNumber()
    idPihak: number;
  
    @IsDateString()
    tanggal: string;
  
    @IsString()
    keterangan: string;
  
    @IsNumber()
    jumlah: number;
  }  