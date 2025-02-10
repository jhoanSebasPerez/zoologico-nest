import { forwardRef, Module } from '@nestjs/common';
import { ZonesService } from './zones.service';
import { ZonesController } from './zones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Zone } from './entities/zone.entity';
import { AuthModule } from 'src/auth/auth.module';
import { SpeciesModule } from 'src/species/species.module';
import { ZoneRepository } from './repositories/zones.repository';

@Module({
  controllers: [ZonesController],
  providers: [ZonesService, ZoneRepository],
  imports: [
    TypeOrmModule.forFeature([Zone]),
    AuthModule,
    forwardRef(() => SpeciesModule)
  ],
  exports: [ZonesService, TypeOrmModule]
})
export class ZonesModule { }