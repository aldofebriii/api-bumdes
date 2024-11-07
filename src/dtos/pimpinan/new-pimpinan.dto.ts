import { IsString } from "class-validator";

export class NewPimpinanDTO {
    @IsString()
    nama: string;

    @IsString()
    alamat: string;
}