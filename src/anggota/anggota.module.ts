import { Module } from "@nestjs/common";
import { AnggotaService } from "./anggota.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Anggota } from "./anggota.entity";
import AnggotaController from "./anggota.controller";
import { CurrentUserInterceptor } from "src/interceptors/current-user.interceptor";
import { CurrentPerusahaanProvider } from "src/auth/current-perusahaan.service";
import PerusahaanModule from "src/perusahaan/perusahaan.module";

@Module({
    exports: [AnggotaService, TypeOrmModule],
    controllers: [AnggotaController],
    imports: [TypeOrmModule.forFeature([Anggota]), PerusahaanModule],
    providers: [
        AnggotaService,
        CurrentUserInterceptor,
        CurrentPerusahaanProvider
    ]
})

export default class AnggotaModule {}