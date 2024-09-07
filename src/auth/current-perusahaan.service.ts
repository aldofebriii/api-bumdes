import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class CurrentPerusahaanProvider {
  constructor(@Inject(REQUEST) private readonly req: Request) {}

  getPerusahaan() {
    return this.req.perusahaan;
  }
}
