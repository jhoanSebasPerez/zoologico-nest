import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { SpeciesRepository } from './repositories/species.repository';
import { ZonesService } from 'src/zones/zones.service';
import { SpecieAlreadyExistsException } from './exceptions/specie-already-exists.exception';
import { PaginationQueryDto, PaginationResponseDto } from 'src/common/dtos';
import { SpecieNotFoundException } from './exceptions/specie-not-found.exception';
import { SpecieCanNotDeleteException } from './exceptions/specie-can-not-delete.exception';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { SpeciesProjectionDto } from './dto/specie-projection.dto';
import { SpecieProjectionDetailDto } from './dto/especie-projection-detail.dto';

@Injectable()
export class SpeciesService {

  constructor(
    private readonly speciesRepository: SpeciesRepository,
    @Inject(forwardRef(() => ZonesService))
    private readonly zoneService: ZonesService
  ) { }

  async create(createSpeciesDto: CreateSpeciesDto) {
    const { zoneId, name, ...specieData } = createSpeciesDto;

    const zone = await this.zoneService.findZoneById(zoneId);

    if (await this.speciesRepository.findSpecieByName(name)) {
      throw new SpecieAlreadyExistsException(name);
    }

    const newSpecie = this.speciesRepository.create({
      ...specieData,
      name,
      zone
    });

    await this.speciesRepository.save(newSpecie);

    return newSpecie
  }

  async findAllSpecies(query: PaginationQueryDto): Promise<PaginationResponseDto<SpeciesProjectionDto>> {
    const [species, total] = await this.speciesRepository.findAllSpecies(query);

    return new PaginationResponseDto<SpeciesProjectionDto>(
      species,
      total,
      query.page ?? 1,
      Math.ceil(total / (query.limit ?? 10))
    );
  }

  async findSpecieById(id: string) {
    const specie = await this.speciesRepository.findOneBy({ id });

    if (!specie) {
      throw new SpecieNotFoundException(id);
    }

    return specie;
  }

  async findSpecieDetailById(id: string, relations: string[] = []): Promise<SpecieProjectionDetailDto | null> {
    const specie = await this.speciesRepository.findSpecieDetailById(id);

    if (!specie) {
      return null;
    }

    return specie;
  }

  async deleteById(id: string) {
    const specieHasAnimals = await this.speciesRepository.hasAssignedAnimals(id);
    if (specieHasAnimals) {
      throw new SpecieCanNotDeleteException(id);
    }

    await this.speciesRepository.delete(id);
  }

  async updateSpecie(id: string, updateSpecieDto: UpdateSpeciesDto) {
    const specie = await this.findSpecieById(id);
    const zone = await this.zoneService.findZoneById(updateSpecieDto.zoneId);

    await this.speciesRepository.save({
      ...specie,
      ...updateSpecieDto,
      zone
    });

    return await this.findSpecieById(id);
  }

  async getAnimalCountBySpecies() {
    return this.speciesRepository.getAnimalCountBySpecies();
  }
}