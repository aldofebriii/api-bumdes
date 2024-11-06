import { IsEmail, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class AuthUserDTO {
  @IsEmail()
  email: string;
  @IsString()
  kata_sandi: string;
}

export class CurrentUserDTO {
  @Expose()
  id: number;
  @Expose()
  email: string;
  @Expose()
  nama: string;
}
