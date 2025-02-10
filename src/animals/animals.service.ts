import { Injectable } from '@nestjs/common';
import { CreateAnimalDto } from './dto/request/create-animal.dto';
import { AnimalAlreadyExistsException } from './exceptions/animal-already-exists.exception';
import { SpeciesService } from 'src/species/species.service';
import { PaginationQueryDto, PaginationResponseDto } from 'src/common/dtos';
import { AnimalNotFoundException } from './exceptions/animal-not-found.exception';
import { AnimalRepository } from './repositories/animal.repository';
import { AnimalProjectionDto } from './dto/projections/animal-projection.dto';
import { AnimalDetailProjectionDto } from './dto/projections/animal-detail-projection.dto';
import { CommentsService } from 'src/comments/comments.service';

@Injectable()
export class AnimalsService {

  constructor(
    private readonly animalRepository: AnimalRepository,
    private readonly speciesService: SpeciesService,
    private readonly commentService: CommentsService
  ) { }

  async create(createAnimalDto: CreateAnimalDto) {
    const { name, specieId, ...animalData } = createAnimalDto;

    if (await this.animalRepository.findAnimalByName(name)) {
      throw new AnimalAlreadyExistsException();
    }

    const specie = await this.speciesService.findSpecieById(specieId);

    const animal = this.animalRepository.create({
      ...animalData,
      name,
      specie
    });

    await this.animalRepository.save(animal);

    return animal;
  }

  async findAllAnimals(query: PaginationQueryDto): Promise<PaginationResponseDto<AnimalProjectionDto>> {
    const [animals, total] = await this.animalRepository.findAllAnimals(query);
    return new PaginationResponseDto<AnimalProjectionDto>(animals, total, query.page ?? 1, Math.ceil(total / (query.limit ?? 10)));
  }

  async findById(id: string): Promise<AnimalDetailProjectionDto> {
    const animal = await this.animalRepository.findAnimalDetailById(id);

    if (!animal) {
      throw new AnimalNotFoundException(id);
    }

    return animal;
  }

  async getAnimalComments(id: string) {
    return this.commentService.getCommentsByAnimalId(id);
  }

  async updateById(id: string, updateAnimalDto: any) {
    const animal = await this.findById(id);
    const specie = await this.speciesService.findSpecieById(updateAnimalDto.specieId);

    await this.animalRepository.save({
      ...animal,
      ...updateAnimalDto,
      specie
    });

    return this.findById(id);
  }

  async deleteById(id: string) {
    const animalToDelete = await this.findById(id);
    await this.animalRepository.delete(animalToDelete);
  }

  async getAnimalsByRegistrationDate(date: string) {
    return this.animalRepository.findAnimalsByRegistrationDate(date);
  }

  async searchAnimals(keyword: string): Promise<AnimalDetailProjectionDto[]> {
    return this.animalRepository.searchAnimals(keyword);
  }
}
