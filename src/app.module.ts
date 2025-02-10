import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ZonesModule } from './zones/zones.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { SpeciesModule } from './species/species.module';
import { AnimalsModule } from './animals/animals.module';
import { CommentsModule } from './comments/comments.module';
import { IndicatorsModule } from './indicators/indicators.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ImportsModule } from './imports/imports.module';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor
    }
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'assets'),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: true,
        logger: 'advanced-console',
      }),
    }),
    AuthModule,
    ZonesModule,
    SpeciesModule,
    AnimalsModule,
    CommentsModule,
    IndicatorsModule,
    ImportsModule
  ]
})
export class AppModule { }
