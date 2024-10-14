import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import PersediaanService from './persediaan.service';
import { Response } from 'express';
import { NewPersediaanDTO } from 'src/dtos/persediaan/new-persediaan.dto';
import { PerusahaanGuard } from 'src/guard/perusahaan.guard';
import { CurrentUserInterceptor } from 'src/interceptors/current-user.interceptor';

@UseInterceptors(CurrentUserInterceptor)
@UseGuards(PerusahaanGuard)
@Controller('persediaan')
export default class PersediaanController {
  constructor(private persediaanService: PersediaanService) {}
  @Post()
  createNew(@Body() newPersediaan: NewPersediaanDTO, @Res() res: Response) {
    return this.persediaanService.createOrEdit(newPersediaan);
  }

  @Get()
  getPersediaan() {
    return this.persediaanService.fetchPersediaan()
  }
}
