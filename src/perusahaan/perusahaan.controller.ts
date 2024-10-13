import { Body, Controller, Get, Post, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import PerusahaanService from './perusahaan.service';
import { Response } from 'express';
import { NewPerusahaanDTO } from 'src/dtos/perusahaan/new-perusahaan.dto';
import { PerusahaanGuard } from 'src/guard/perusahaan.guard';
import { CurrentUserInterceptor } from 'src/interceptors/current-user.interceptor';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Perusahaan } from './perusahaan.entity';

@Controller('perusahaan')
export default class PerusahaanController {
  constructor(private perusahaanService: PerusahaanService) {}
  @Post()
  async create(@Body() newPerusahaan: NewPerusahaanDTO, @Res() res: Response) {
    console.log(newPerusahaan);
    const perusahaan = await this.perusahaanService.createOrEdit(newPerusahaan);
    return res.status(201).json(perusahaan);
  }

  @Get('/profil')
  @UseInterceptors(CurrentUserInterceptor)
  @UseGuards(PerusahaanGuard)
  async profile(@CurrentUser() perusahaan: Perusahaan, @Res() res: Response) {
    const profil = await this.perusahaanService.getProfile(perusahaan.id);
    return res.status(200).json(profil);
  }
}