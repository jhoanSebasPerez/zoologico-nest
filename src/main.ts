if (!globalThis.crypto) {
  globalThis.crypto = require('crypto');
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ImportsService } from './imports/imports.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.flatMap(err => {
          if (err.constraints) {
            return Object.values(err.constraints).map(msg => `${err.property}: ${msg}`);
          }
          return [];
        }
        );
        return new BadRequestException(formattedErrors);
      },
    }),
  );

  const seederService = app.get(ImportsService);  // Obtener la instancia del servicio Seeder
  await seederService.seedDatabase();  // Llamar al método seedDatabase

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
