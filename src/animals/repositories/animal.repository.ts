import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Animal } from '../entities/animal.entity';
import { AnimalProjectionDto } from '../dto/projections/animal-projection.dto';
import { AnimalDetailProjectionDto } from '../dto/projections/animal-detail-projection.dto';
import { PaginationQueryDto } from 'src/common/dtos';

@Injectable()
export class AnimalRepository extends Repository<Animal> {
    constructor(private readonly dataSource: DataSource) {
        super(Animal, dataSource.getRepository(Animal).manager);
    }

    async findAnimalByName(name: string): Promise<Animal | undefined> {
        return this.createQueryBuilder('animal')
            .where('animal.name = :name', { name })
            .getOne() as Promise<Animal | undefined>;
    }

    async findAllAnimals(query: PaginationQueryDto): Promise<[AnimalProjectionDto[], number]> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const sortBy = query.sortBy ?? 'createdAt';
        const order = query.order?.toUpperCase() as 'ASC' | 'DESC' ?? 'DESC';

        const rawAnimals = await this.createQueryBuilder('animal')
            .select([
                'animal.id AS id',
                'animal.name AS name',
                'animal.createdAt AS createdAt'
            ])
            .orderBy(`animal.${sortBy}`, order)
            .limit(limit)
            .offset((page - 1) * limit)
            .getRawMany();

        const animals = rawAnimals.map(this.mapToAnimalBasicProjectionDto);

        const total = await this.createQueryBuilder('animal').getCount();

        return [animals, total];
    }

    async findAnimalDetailById(id: string): Promise<AnimalDetailProjectionDto | undefined> {
        const rawData = await this.createQueryBuilder('animal')
            .leftJoinAndSelect('animal.specie', 'species')
            .select([
                'animal.id AS id',
                'animal.name AS name',
                'animal.createdAt AS createdAt',
                'species.id AS specieId',
                'species.name AS specieName'
            ])
            .where('animal.id = :id', { id })
            .getRawOne();

        return rawData ? this.mapToAnimalDetailProjectionDto(rawData) : undefined;
    }

    async searchAnimals(keyword: string): Promise<AnimalDetailProjectionDto[]> {
        const rawAnimals = await this.createQueryBuilder('animal')
            .leftJoinAndSelect('animal.specie', 'species')
            .where('LOWER(animal.name) LIKE LOWER(:keyword)', { keyword: `%${keyword}%` })
            .select([
                'animal.id AS id',
                'animal.name AS name',
                'animal.createdAt AS createdAt',
                'species.id AS specieId',
                'species.name AS specieName'
            ])
            .getRawMany();

        return rawAnimals.map(this.mapToAnimalDetailProjectionDto);
    }

    async findAnimalsByRegistrationDate(date: string): Promise<AnimalDetailProjectionDto[]> {
        const rawAnimals = await this.createQueryBuilder('animal')
            .leftJoinAndSelect('animal.specie', 'species')
            .leftJoinAndSelect('species.zone', 'zone')
            .select([
                'animal.id AS id',
                'animal.name AS name',
                'animal.createdAt AS createdAt',
                'species.id AS specieId',
                'species.name AS specieName',
                'zone.id AS zoneId',
                'zone.name AS zoneName'
            ])
            .where('DATE(animal.createdAt) = :date', { date })
            .orderBy('animal.createdAt', 'ASC')
            .getRawMany();

        return rawAnimals.map(this.mapToAnimalDetailProjectionDto);
    }

    private mapToAnimalBasicProjectionDto(raw: any): AnimalProjectionDto {
        return {
            id: raw.id,
            name: raw.name,
            createdAt: raw.createat
        };
    }

    private mapToAnimalDetailProjectionDto(raw: any): AnimalDetailProjectionDto {
        return {
            id: raw.id,
            name: raw.name,
            createdAt: raw.createdat,
            especie: {
                id: raw.specieid,
                name: raw.speciename
            }
        };
    }
}
