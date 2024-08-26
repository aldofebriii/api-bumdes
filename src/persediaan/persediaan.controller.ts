import { Controller, Post, Body, Res } from '@nestjs/common';
import PersediaanService from './persediaan.service';
import { Response } from 'express';

export interface NewPersediaanDTO {
  sku: string;
  nama_barang: string;
  kuantitas: number;
  harga_beli_barang: number;
  perusahaan_id: number;
}

@Controller('persediaan')
export default class PersediaanController {
  constructor(private persediaanService: PersediaanService) {}
  @Post()
  async createNew(
    @Body() newPersediaan: NewPersediaanDTO,
    @Res() res: Response,
  ) {
    const persediaan = await this.persediaanService.createOrEdit(newPersediaan);
    return res.status(201).json(persediaan);
  }
}
