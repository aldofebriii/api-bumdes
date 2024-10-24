import { IsString } from "class-validator";

export class NewAnggotaDTO {
    @IsString()
    nama: string;

    @IsString()
    email: string;

    @IsString()
    no_telepon: string;

    @IsString()
    kata_sandi: string;

    @IsString()
    roles: string;
}