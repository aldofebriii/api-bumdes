import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class CurrentUserProvider {
  constructor(@Inject(REQUEST) private readonly req: Request) {}

  getUser() {
    return this.req.user;
  }
}