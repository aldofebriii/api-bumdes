import { IsString } from 'class-validator';
import { NewPerusahaanDTO } from '../perusahaan/new-perusahaan.dto';

export class NewUserDTO {
  perusahaan: NewPerusahaanDTO;
  
  @IsString()
  nama: string;

  @IsString()
  email: string;

  @IsString()
  kata_sandi: string;
}
