import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import UserController from './user.controller';
import UserService from './user.service';
import { Perusahaan } from 'src/perusahaan/perusahaan.entity';

@Module({
  controllers: [UserController],
  exports: [UserService, TypeOrmModule],
  imports: [TypeOrmModule.forFeature([User, Perusahaan])],
  providers: [UserService],
})
export default class UserModule {}
