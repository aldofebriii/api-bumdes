import { IsString, IsEmail, IsPhoneNumber } from "class-validator";

export class NewPerusahaanDTO {
    @IsString()
    nama_perusahaan: string;

    @IsEmail()
    email_perusahaan: string;
    
    @IsPhoneNumber()
    nomor_telepon: string;

    @IsString()
    alamat_perusahaan: string;

    @IsString()
    nama_pimpinan: string;

    @IsString()
    alamat_pimpinan: string;

}