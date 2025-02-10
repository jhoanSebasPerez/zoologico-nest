import { forwardRef, Module } from '@nestjs/common';
import { AnimalsService } from './animals.service';
import { AnimalsController } from './animals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Animal } from './entities/animal.entity';
import { AuthModule } from 'src/auth/auth.module';
import { SpeciesModule } from 'src/species/species.module';
import { CommentsModule } from 'src/comments/comments.module';
import { AnimalRepository } from './repositories/animal.repository';

@Module({
  controllers: [AnimalsController],
  providers: [AnimalsService, AnimalRepository],
  imports: [
    TypeOrmModule.forFeature([Animal]),
    AuthModule,
    SpeciesModule,
    forwardRef(() => CommentsModule)
  ],
  exports: [AnimalsService, TypeOrmModule, AnimalRepository]
})
export class AnimalsModule { }
