import { Body, Controller, Post, Res } from '@nestjs/common';
import PerusahaanService from './perusahaan.service';
import { Response } from 'express';
import { NewPerusahaanDTO } from 'src/dtos/perusahaan/new-perusahaan.dto';

@Controller('perusahaan')
export default class PerusahaanController {
  constructor(private perusahaanService: PerusahaanService) {}
  @Post()
  async create(@Body() newPerusahaan: NewPerusahaanDTO, @Res() res: Response) {
    const perusahaan = await this.perusahaanService.createOrEdit(newPerusahaan);
    return res.status(201).json(perusahaan);
  }
}