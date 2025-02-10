import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Species } from '../entities/species.entity';
import { SpeciesProjectionDto } from '../dto/specie-projection.dto';
import { PaginationQueryDto } from 'src/common/dtos';
import { SpecieProjectionDetailDto } from '../dto/especie-projection-detail.dto';

@Injectable()
export class SpeciesRepository extends Repository<Species> {
    constructor(private readonly dataSource: DataSource) {
        super(Species, dataSource.getRepository(Species).manager);
    }

    async findSpecieByName(name: string): Promise<Species | undefined> {
        return this.createQueryBuilder('species')
            .where('species.name = :name', { name })
            .getOne() as Promise<Species | undefined>;
    }

    async findAllSpecies(query: PaginationQueryDto): Promise<[SpeciesProjectionDto[], number]> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const sortBy = query.sortBy ?? 'createdAt';
        const order = query.order?.toUpperCase() as 'ASC' | 'DESC' ?? 'DESC';

        const rawSpecies = await this.createQueryBuilder('species')
            .leftJoinAndSelect('species.zone', 'zone')
            .leftJoin('species.animals', 'animals')
            .select([
                'species.id AS id',
                'species.name AS name',
                'zone.id AS zoneId',
                'zone.name AS zoneName',
                'COUNT(animals.id) AS countOfAnimals'
            ])
            .groupBy('species.id, zone.id')
            .orderBy(`species.${sortBy}`, order)
            .limit(limit)
            .offset((page - 1) * limit)
            .getRawMany();

        const species = rawSpecies.map(this.mapToSpeciesProjectionDto);

        const total = await this.createQueryBuilder('species').getCount();

        return [species, total];
    }

    async getAnimalCountBySpecies() {
        return this.createQueryBuilder('species')
            .leftJoin('species.animals', 'animals')
            .select('species.id', 'speciesId')
            .addSelect('species.name', 'speciesName')
            .addSelect('COUNT(animals.id)', 'animalCount')
            .groupBy('species.id')
            .orderBy('animalCount', 'DESC')
            .getRawMany();
    }

    async hasAssignedAnimals(specieId: string): Promise<boolean> {
        const count = await this.createQueryBuilder('species')
            .leftJoin('species.animals', 'animals')
            .where('species.id = :specieId', { specieId })
            .andWhere('animals.id IS NOT NULL')
            .getCount();

        return count > 0;
    }

    async findSpecieDetailById(id: string): Promise<SpecieProjectionDetailDto | undefined> {
        const rawData = await this.createQueryBuilder('species')
            .leftJoinAndSelect('species.zone', 'zone')
            .leftJoinAndSelect('species.animals', 'animals')
            .select([
                'species.id AS id',
                'species.name AS name',
                'zone.id AS zoneId',
                'zone.name AS zoneName',
                'animals.id AS animalId',
                'animals.name AS animalName'
            ])
            .where('species.id = :id', { id })
            .getRawMany();

        return rawData.length ? this.mapToSpecieDetailProjectionDto(rawData) : undefined;
    }

    private mapToSpeciesProjectionDto(raw: any): SpeciesProjectionDto {
        return {
            id: raw.id,
            name: raw.name,
            zone: {
                id: raw.zoneid,
                name: raw.zonename
            },
            countOfAnimals: Number(raw.countofanimals)
        };
    }

    private mapToSpecieDetailProjectionDto(rawData: any[]): SpecieProjectionDetailDto {
        return {
            id: rawData[0].id,
            name: rawData[0].name,
            zone: {
                id: rawData[0].zoneid,
                name: rawData[0].zonename
            },
            animals: rawData.map(animal => ({
                id: animal.animalid,
                name: animal.animalname
            })).filter(animal => animal.id !== null)
        };
    }
}
