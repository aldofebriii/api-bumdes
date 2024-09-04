import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import PersediaanService from './persediaan.service';
import { Response } from 'express';
import { NewPersediaanDTO } from 'src/dtos/persediaan/new-persediaan.dto';

@Controller('persediaan')
export default class PersediaanController {
  private DUMMY_PERUSAHAAN_ID = 1;
  constructor(private persediaanService: PersediaanService) {}
  @Post()
  async createNew(
    @Body() newPersediaan: NewPersediaanDTO,
    @Res() res: Response,
  ) {
    const persediaan = await this.persediaanService.createOrEdit(newPersediaan);
    return res.status(201).json(persediaan);
  }

  @Get()
  async getPersediaan(
    @Res() res: Response,
  ) {
    return res.status(200).json(
      await this.persediaanService.fetchPersediaan(this.DUMMY_PERUSAHAAN_ID)
    );
  }
}
