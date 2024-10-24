import { Module } from "@nestjs/common";
import { AnggotaService } from "./anggota.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Anggota } from "./anggota.entity";
import AnggotaController from "./anggota.controller";

@Module({
    controllers: [AnggotaController],
    exports: [AnggotaService, TypeOrmModule],
    imports: [TypeOrmModule.forFeature([Anggota])],
    providers: [AnggotaService]
})

export default class AnggotaModule {}