import { NestFactory } from '@nestjs/core';
import SeedModule from './seed/seed.module';
import SeedService from './seed/seed.service';

async function bootstrap() {
  NestFactory.createApplicationContext(SeedModule)
    .then(async (ctx) => {
      const seeder = ctx.get(SeedService);
      await seeder.generateCoA();
      await seeder.generatePerusahaan();
      await seeder.generatePersediaan();
      ctx.close();
    })
    .catch((err) => {
      throw err;
    });
}

bootstrap();
