import { Controller } from '@nestjs/common';
import { StatusPihak } from './pihak.entity';
/**
 * @description this DTO only created from the transaksiService, because pihak will be generated after transaction has been made.
 */
export interface NewPihakDTO {
  nama: string;
  jatuh_tempo_awal: string;
  jatuh_tempo_akhir: string;
  status: StatusPihak;
  jumlah: number;
}

@Controller('pihak')
export default class PihakController {
  
}
