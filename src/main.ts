import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

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
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
