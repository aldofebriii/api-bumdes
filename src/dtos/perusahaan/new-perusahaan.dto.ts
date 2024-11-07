import { IsString, IsEmail, IsPhoneNumber } from "class-validator";
import { NewPimpinanDTO } from "../pimpinan/new-pimpinan.dto";

export class NewPerusahaanDTO {
    @IsString()
    nama: string;

    @IsEmail()
    email: string;
    
    @IsPhoneNumber()
    nomor_telepon: string;

    @IsString()
    alamat: string;

    pimpinan: NewPimpinanDTO;
}