import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import UserService from 'src/user/user.service';
import UserModule from 'src/user/user.module';
import { CurrentUserInterceptor } from 'src/interceptors/current-user.interceptor';

@Module({
  controllers: [AuthController],
  imports: [UserModule],
  providers: [AuthService, UserService, CurrentUserInterceptor],
})
export class AuthModule {}
