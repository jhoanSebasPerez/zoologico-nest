import { Module } from '@nestjs/common';
import { IndicatorsService } from './indicators.service';
import { IndicatorsController } from './indicators.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ZonesModule } from 'src/zones/zones.module';
import { CommentsModule } from 'src/comments/comments.module';
import { SpeciesModule } from 'src/species/species.module';
import { AnimalsModule } from 'src/animals/animals.module';

@Module({
  controllers: [IndicatorsController],
  providers: [IndicatorsService],
  imports: [AuthModule, ZonesModule, CommentsModule, SpeciesModule, AnimalsModule]
})
export class IndicatorsModule { }
