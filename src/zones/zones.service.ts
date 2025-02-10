import { Injectable, Logger } from '@nestjs/common';
import { CreateZoneDto } from './dto/request/create-zone.dto';
import { PaginationQueryDto, PaginationResponseDto } from 'src/common/dtos';
import { ZoneNotFoundException } from './exceptions/zone-not-found.exception';
import { ZoneCanNotDeleteException } from './exceptions/zone-can-not-delete.exception';
import { ZoneAlreadyExistsException } from './exceptions/zone-already-exists.exception';
import { ZoneRepository } from './repositories/zones.repository';
import { SpeciesService } from 'src/species/species.service';
import { ZoneProjectionDto } from './dto/projections/zone-projection.dto';
import { Zone } from './entities/zone.entity';

@Injectable()
export class ZonesService {
  private readonly logger = new Logger(ZonesService.name);

  constructor(
    private readonly zoneRepository: ZoneRepository,
    private readonly specieService: SpeciesService
  ) { }

  async create(createZoneDto: CreateZoneDto) {
    const { name, ...zoneData } = createZoneDto;

    const zoneExists = await this.zoneRepository.findZoneByName(name);
    if (zoneExists) {
      throw new ZoneAlreadyExistsException();
    }

    const newZone = this.zoneRepository.create({
      ...zoneData,
      name,
    });

    await this.zoneRepository.save(newZone);

    return newZone;
  }

  async findAllZones(query: PaginationQueryDto): Promise<PaginationResponseDto<ZoneProjectionDto>> {
    const [zones, total] = await this.zoneRepository.findAllZones(query);

    return new PaginationResponseDto<ZoneProjectionDto>(
      zones,
      total,
      query.page ?? 1,
      Math.ceil(total / (query.limit ?? 10))
    );
  }

  async findZoneDetailById(id: string) {
    const zone = await this.zoneRepository.findZoneDetailById(id);
    if (!zone) {
      throw new ZoneNotFoundException(id);
    }
    return zone;
  }

  async findZoneById(id: string, options?: { relations?: string[] }) {
    const zone = await this.zoneRepository.findZoneById(id, options?.relations ?? []);
    if (!zone) {
      throw new ZoneNotFoundException(id);
    }
    return zone;
  }

  async deleteZone(id: string) {
    const zone = await this.findZoneById(id, { relations: ['species'] });
    const especies = zone['species'];

    let hasAnimals = false;
    for (const specie of especies) {
      const specieFromDB = await this.specieService.findSpecieDetailById(specie.id, ['animals']);
      if (!!specieFromDB && (specieFromDB.animals && specieFromDB.animals.length > 0)) {
        hasAnimals = true;
        break;
      }
    }

    if (hasAnimals) {
      throw new ZoneCanNotDeleteException(id);
    }

    await this.zoneRepository.remove(zone as Zone);
  }

  async updateZone(id: string, updateZoneDto: CreateZoneDto) {
    if (await this.zoneRepository.findZoneByName(updateZoneDto.name)) {
      throw new ZoneAlreadyExistsException();
    }

    const zone = await this.findZoneById(id);
    await this.zoneRepository.save({ ...zone, ...updateZoneDto });

    return this.findZoneById(id);
  }

  async getAnimalsCountByZone() {
    return this.zoneRepository.getAnimalsCountByZone();
  }

  async searchZones(keyword: string) {
    return this.zoneRepository.searchZones(keyword);
  }
}