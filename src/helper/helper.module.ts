import { Module } from '@nestjs/common';
import HelperService from './helper.service';

@Module({
  exports: [HelperService],
  providers: [HelperService],
})
export default class HelperModule {}
