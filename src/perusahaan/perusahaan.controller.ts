import { Body, Controller, Get, Post, Res, UseGuards, UseInterceptors } from "@nestjs/common";
import PerusahaanService from "./perusahaan.service";
import { NewPerusahaanDTO } from "src/dtos/perusahaan/new-perusahaan.dto";
import { Response } from "express";
import { CurrentUser } from "src/decorators/current-user.decorator";
import { User } from "src/user/user.entity";
import { CurrentUserInterceptor } from "src/interceptors/current-user.interceptor";
import { UserGuard } from "src/guard/user.guard";

@Controller('perusahaan')
export default class PerusahaanController {
    constructor(private perusahaanService: PerusahaanService) {}

    // @Post()
    // async create(@Body() newPerusahaan: NewPerusahaanDTO, @Res() res: Response) {
    //     const perusahaan = await this.perusahaanService.createOrEdit(newPerusahaan);
    //     return res.status(201).json(perusahaan);
    // }
}