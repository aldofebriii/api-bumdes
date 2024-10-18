import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { StatusPihak } from './pihak.entity';
import PihakService from './pihak.service';
import { PerusahaanGuard } from 'src/guard/perusahaan.guard';
import { CurrentUserInterceptor } from 'src/interceptors/current-user.interceptor';
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

@UseInterceptors(CurrentUserInterceptor)
@UseGuards(PerusahaanGuard)
@Controller('pihak')
export default class PihakController {
  constructor(
    private pihakService: PihakService,
  ) {}

  @Get('kreditur')
  getKreditur() {
    return this.pihakService.getKreditur();
  }

  @Get('debitur')
  getDebitur() {
    return this.pihakService.getDebitur();
  }
}
