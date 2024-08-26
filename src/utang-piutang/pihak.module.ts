import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Pihak from './pihak.entity';
import PihakService from './pihak.service';
import HelperModule from 'src/helper/helper.module';
import HelperService from 'src/helper/helper.service';
import PihakController from './pihak.controller';
@Module({
  controllers: [PihakController],
  imports: [TypeOrmModule.forFeature([Pihak]), HelperModule],
  providers: [PihakService, HelperService],
  exports: [PihakService, TypeOrmModule],
})
export default class PihakModule {}
