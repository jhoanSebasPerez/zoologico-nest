import { Module } from '@nestjs/common';
import { ImportsService } from './imports.service';
import { ImportsController } from './imports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Zone } from 'src/zones/entities/zone.entity';
import { Species } from 'src/species/entities/species.entity';
import { Animal } from 'src/animals/entities/animal.entity';
import { ZonesModule } from 'src/zones/zones.module';
import { SpeciesModule } from 'src/species/species.module';
import { AnimalsModule } from 'src/animals/animals.module';
import { User } from 'src/auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Zone, Species, Animal, User]),
    ZonesModule,
    SpeciesModule,
    AnimalsModule,
  ],
  controllers: [ImportsController],
  providers: [ImportsService],
})
export class ImportsModule { }
