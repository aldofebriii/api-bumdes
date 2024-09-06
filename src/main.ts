import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
const cookieSession = require('cookie-session');
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    cookieSession({
      name: 'session',
      keys: ['key_1'],

      // Cookie Options
      maxAge: 6 * 60 * 60 * 1000, // 24 hours
    }),
  );
  app.useGlobalPipes(new ValidationPipe({ forbidNonWhitelisted: true }));
  app.enableCors();
  await app.listen(8000);
}
bootstrap();
