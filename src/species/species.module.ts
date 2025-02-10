import { forwardRef, Module } from '@nestjs/common';
import { SpeciesService } from './species.service';
import { SpeciesController } from './species.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Species } from './entities/species.entity';
import { ZonesModule } from 'src/zones/zones.module';
import { AuthModule } from 'src/auth/auth.module';
import { SpeciesRepository } from './repositories/species.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Species]),
    AuthModule,
    forwardRef(() => ZonesModule),
  ],
  controllers: [SpeciesController],
  providers: [SpeciesService, SpeciesRepository],
  exports: [SpeciesService, TypeOrmModule]
})
export class SpeciesModule { }
