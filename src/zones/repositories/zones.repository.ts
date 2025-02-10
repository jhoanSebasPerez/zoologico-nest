import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Zone } from "../entities/zone.entity";
import { ZoneProjectionDto } from "../dto/projections/zone-projection.dto";
import { PaginationQueryDto } from "src/common/dtos";
import { ZoneProjectionDetailDto } from "../dto/projections/zone-detail-projection.dto";

@Injectable()
export class ZoneRepository extends Repository<Zone> {
    constructor(private readonly dataSource: DataSource) {
        super(Zone, dataSource.getRepository(Zone).manager);
    }

    async findZoneByName(name: string): Promise<Zone | undefined> {
        return this.createQueryBuilder('zone')
            .where('zone.name = :name', { name })
            .getOne() as Promise<Zone | undefined>;
    }

    async findZoneById(id: string, relations: string[] = []): Promise<ZoneProjectionDto | undefined> {
        const query = this.createQueryBuilder('zone')
            .select(['zone.id', 'zone.name', 'zone.createdAt'])
            .where('zone.id = :id', { id });

        if (relations.length > 0) {
            relations.forEach(relation => {
                query.leftJoinAndSelect(`zone.${relation}`, relation);
            });
        }

        const rawData = await query.getOne();
        return rawData ? this.mapToZoneProjectionDto(rawData) : undefined;
    }

    async findZoneDetailById(id: string): Promise<ZoneProjectionDto | undefined> {
        const rawData = await this.createQueryBuilder('zone')
            .leftJoinAndSelect('zone.species', 'species')
            .select([
                'zone.id AS "id"',
                'zone.name AS "name"',
                'zone.createdAt AS "createdAt"',
                'species.id AS "speciesId"',
                'species.name AS "speciesName"'
            ])
            .where('zone.id = :id', { id })
            .getRawMany();

        return rawData.length ? this.mapToZoneDetailProjectionDto(rawData) : undefined;
    }

    async findAllZones(query: PaginationQueryDto): Promise<[ZoneProjectionDto[], number]> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const sortBy = query.sortBy ?? 'createdAt';
        const order = query.order?.toUpperCase() as 'ASC' | 'DESC' ?? 'DESC';

        const rawZones = await this.createQueryBuilder('zone')
            .leftJoin('zone.species', 'species')
            .select([
                'zone.id AS "id"',
                'zone.name AS "name"',
                'zone.createdAt AS "createdAt"',
                'COUNT(species.id) AS "numberOfSpecies"'
            ])
            .groupBy('zone.id')
            .orderBy(`zone.${sortBy}`, order)
            .limit(limit)
            .offset((page - 1) * limit)
            .getRawMany();

        const total = await this.createQueryBuilder('zone').getCount();

        const zones = rawZones.map(this.mapToZoneProjectionDto);

        return [zones, total];
    }

    async getAnimalsCountByZone() {
        return this.createQueryBuilder('zone')
            .leftJoin('zone.species', 'species')
            .leftJoin('species.animals', 'animals')
            .select('zone.id', 'zoneId')
            .addSelect('zone.name', 'zoneName')
            .addSelect('COUNT(animals.id)', 'animalCount')
            .groupBy('zone.id')
            .orderBy('animalCount', 'DESC')
            .getRawMany();
    }

    async searchZones(keyword: string): Promise<ZoneProjectionDto[]> {
        const rawZones = await this.createQueryBuilder('zone')
            .select(['zone.id', 'zone.name', 'zone.createdAt'])
            .where('LOWER(zone.name) LIKE LOWER(:keyword)', { keyword: `%${keyword}%` })
            .getMany();

        return rawZones.map(this.mapToZoneProjectionDto);
    }

    // 🔥 Método privado para mapear a ZoneProjectionDto
    private mapToZoneProjectionDto(zone: any): ZoneProjectionDto {
        return {
            id: zone.id,
            name: zone.name,
            createdAt: zone.createdAt,
            numberOfSpecies: zone.numberOfSpecies ? Number(zone.numberOfSpecies) : undefined
        };
    }

    // 🔥 Método privado para mapear los detalles de la zona
    private mapToZoneDetailProjectionDto(rawData: any[]): ZoneProjectionDetailDto {
        return {
            id: rawData[0].id,
            name: rawData[0].name,
            createdAt: rawData[0].createdAt,
            species: rawData.map(specie => ({
                id: specie.speciesId,
                name: specie.speciesName
            })).filter(specie => specie.id !== null)
        };
    }
}
