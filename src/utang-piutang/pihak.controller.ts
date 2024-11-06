import { Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { StatusPihak } from './pihak.entity';
import PihakService from './pihak.service';
import { UserGuard } from 'src/guard/user.guard';
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
@UseGuards(UserGuard)
@Controller('pihak')
export default class PihakController {
  constructor(
    private pihakService: PihakService,
  ) {}

  @Get()
  getPihak() {
    return this.pihakService.getPihak();
  }
}
