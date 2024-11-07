import { Module } from "@nestjs/common";
import PerusahaanService from "./perusahaan.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Perusahaan, Pimpinan } from "./perusahaan.entity";
import PerusahaanController from "./perusahaan.controller";
import { CurrentUserInterceptor } from "src/interceptors/current-user.interceptor";
import { CurrentUserProvider } from "src/auth/current-user.service";
import UserModule from "src/user/user.module";

@Module({
    exports: [PerusahaanService, TypeOrmModule],
    controllers: [PerusahaanController],
    imports: [TypeOrmModule.forFeature([Perusahaan, Pimpinan]), UserModule],
    providers: [
        PerusahaanService,
        CurrentUserInterceptor,
        CurrentUserProvider
    ]
})

export default class PerusahaanModule {}