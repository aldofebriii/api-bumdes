import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import PerusahaanService from 'src/perusahaan/perusahaan.service';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private perusahaanService: PerusahaanService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();

    const perusahaan = await this.perusahaanService.findOneById(
      req.session.perusahaanId,
    );
    if (!perusahaan) throw new UnauthorizedException('invalid account');
    req.perusahaan = perusahaan;
    return next.handle();
  }
}
