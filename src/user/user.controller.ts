import { Body, Controller, Get, Post, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import UserService from './user.service';
import { Response } from 'express';
import { NewUserDTO } from 'src/dtos/user/new-user.dto';
import { UserGuard } from 'src/guard/user.guard';
import { CurrentUserInterceptor } from 'src/interceptors/current-user.interceptor';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from './user.entity';

@Controller('user')
export default class UserController {
  constructor(private userService: UserService) {}
  
  @Post('/newAdminAccount')
  async createNewAdminAccount(@Body() newUser: NewUserDTO, @Res() res: Response) {
    const user = await this.userService.create(newUser);
    return res.status(201).json(user);
  }

  @Post('/newUserAccount')
  @UseInterceptors(CurrentUserInterceptor)
  @UseGuards(UserGuard)
  async createNewUserAccount(@CurrentUser() user: User, @Body() newUser: NewUserDTO, @Res() res: Response) {
    const newAccount = await this.userService.create(newUser, user.id);
    return res.status(201).json(newAccount);
  }

  @Get('/profil')
  @UseInterceptors(CurrentUserInterceptor)
  @UseGuards(UserGuard)
  async profile(@CurrentUser() user: User, @Res() res: Response) {
    const profil = await this.userService.getProfile(user.id);
    return res.status(200).json(profil);
  }

  @Get()
  @UseInterceptors(CurrentUserInterceptor)
  @UseGuards(UserGuard)
  async getAnggota(@CurrentUser() user: User, @Res() res: Response) {
    const anggota = await this.userService.getAnggota(user.perusahaan.id);
    return res.status(200).json(anggota);
  }
}