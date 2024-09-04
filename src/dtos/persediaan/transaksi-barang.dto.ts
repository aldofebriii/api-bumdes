import { IsNumber, ValidateNested } from "class-validator";
import { NewPersediaanDTO } from "./new-persediaan.dto";
import { Type } from "class-transformer";

export class TransaksiBarangDTO {
    @IsNumber()
    id: number;
    @IsNumber()
    jumlah: number;
    @ValidateNested()
    @Type(() => NewPersediaanDTO)
    new?: NewPersediaanDTO;
  }