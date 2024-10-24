import { Body, Controller, Get, Post, Res, UseGuards, UseInterceptors } from "@nestjs/common";
import { AnggotaService } from "./anggota.service";
import { NewAnggotaDTO } from "src/dtos/anggota/new-anggota.dto";
import { Response } from "express";
import { CurrentUser } from "src/decorators/current-user.decorator";
import { Perusahaan } from "src/perusahaan/perusahaan.entity";
import { CurrentUserInterceptor } from "src/interceptors/current-user.interceptor";
import { PerusahaanGuard } from "src/guard/perusahaan.guard";

@Controller('anggota')
export default class AnggotaController {
    constructor(private anggotaService: AnggotaService) {}

    @Post()
    async create(@Body() newAnggota: NewAnggotaDTO, @Res() res: Response) {
        const anggota = await this.anggotaService.createOrEdit(newAnggota);
        return res.status(201).json(anggota);
    }

    @Get()
    @UseInterceptors(CurrentUserInterceptor)
    @UseGuards(PerusahaanGuard)
    async getAnggota(@CurrentUser() perusahaan: Perusahaan, @Res() res: Response) {
        const anggota = await this.anggotaService.getAnggota(perusahaan.id);
        return res.status(200).json(anggota);
    }
}