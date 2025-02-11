import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import { Zone } from '../zones/entities/zone.entity';
import { Species } from '../species/entities/species.entity';
import { Animal } from '../animals/entities/animal.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ImportsService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Zone) private readonly zoneRepository: Repository<Zone>,
    @InjectRepository(Species) private readonly speciesRepository: Repository<Species>,
    @InjectRepository(Animal) private readonly animalRepository: Repository<Animal>,
    private readonly dataSource: DataSource
  ) { }

  public async seedDatabase() {
    const userCount = await this.userRepository.count();
    const zoneCount = await this.zoneRepository.count();
    const speciesCount = await this.speciesRepository.count();
    const animalCount = await this.animalRepository.count();

    if (userCount === 0) {
      await this.seedUsers();
    } else {
      console.log('Usuarios ya existen en la base de datos. Seeder no ejecutado para usuarios.');
    }

    if (zoneCount === 0 && speciesCount === 0 && animalCount === 0) {
      await this.seedZonesSpeciesAnimals();
    } else {
      console.log('Zonas, especies o animales ya existen en la base de datos. Seeder no ejecutado para estos datos.');
    }

    if (userCount > 0 && (zoneCount > 0 || speciesCount > 0 || animalCount > 0)) {
      console.log('La base de datos ya contiene datos. Seeder no ejecutado.');
    } else {
      console.log('Seeding completado.');
    }
  }

  private async seedUsers() {
    const users = [
      {
        email: 'admin@zoologico.com',
        fullName: 'Admin Zoológico',
        password: await bcrypt.hash('admin123', 10),
        roles: ['admin'],
        isActive: true
      },
      {
        email: 'empleado1@zoologico.com',
        fullName: 'Empleado Uno',
        password: await bcrypt.hash('empleado123', 10),
        roles: ['employee'],
        isActive: true
      },
      {
        email: 'empleado2@zoologico.com',
        fullName: 'Empleado Dos',
        password: await bcrypt.hash('empleado123', 10),
        roles: ['employee'],
        isActive: true
      }
    ];

    for (const user of users) {
      const existingUser = await this.userRepository.findOne({ where: { email: user.email } });
      if (!existingUser) {
        await this.userRepository.save(user);
      }
    }
    console.log('Usuarios insertados correctamente.');
  }

  private async seedZonesSpeciesAnimals() {
    const zonesData = [
      {
        name: 'Zona Tropical',
        species: [
          {
            name: 'Tucán',
            animals: ['Tucán Toño', 'Tucán Tina']
          },
          {
            name: 'Jaguar',
            animals: ['Jaguar Jairo', 'Jaguar Julia']
          }
        ]
      },
      {
        name: 'Zona Desértica',
        species: [
          {
            name: 'Camello',
            animals: ['Camello Carlos', 'Camello Carla']
          },
          {
            name: 'Lagarto de Gila',
            animals: ['Lagarto Larry', 'Lagarto Laura']
          }
        ]
      },
      {
        name: 'Zona Acuática',
        species: [
          {
            name: 'Delfín',
            animals: ['Delfín Dolly', 'Delfín Diego']
          },
          {
            name: 'Tiburón Blanco',
            animals: ['Tiburón Tom', 'Tiburón Tina']
          }
        ]
      }
    ];

    for (const zoneData of zonesData) {
      let zone = await this.zoneRepository.findOne({ where: { name: zoneData.name } });
      if (!zone) {
        zone = this.zoneRepository.create({ name: zoneData.name });
        await this.zoneRepository.save(zone);
      }

      for (const speciesData of zoneData.species) {
        let species = await this.speciesRepository.findOne({ where: { name: speciesData.name, zone: { id: zone.id } } });
        if (!species) {
          species = this.speciesRepository.create({ name: speciesData.name, zone });
          await this.speciesRepository.save(species);
        }

        for (const animalName of speciesData.animals) {
          const existingAnimal = await this.animalRepository.findOne({ where: { name: animalName, specie: { id: species.id } } });
          if (!existingAnimal) {
            const animal = this.animalRepository.create({ name: animalName, specie: species });
            await this.animalRepository.save(animal);
          }
        }
      }
    }

    console.log('Zonas, especies y animales insertados correctamente.');
  }

  async importDataFromExcel(filePath: string) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];
    const data = worksheet.getSheetValues().slice(2).map(row => ({
      zone: row?.[1] ?? '',
      specie: row?.[2] ?? '',
      animal: row?.[3] ?? ''
    }));

    const errors: { row: number; error: string }[] = [];
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const zonesCache = new Map<string, Zone>();
      const speciesCache = new Map<string, Species>();
      const animalsCache = new Map<string, Animal>();

      for (const [index, row] of data.entries()) {
        const { zone: zoneName, specie: speciesName, animal: animalName } = row;

        if (!zoneName || !speciesName || !animalName) {
          errors.push({ row: index + 2, error: 'Missing data for zone, specie, or animal' });
          continue;
        }

        const normalizedZoneName = zoneName.trim().toLowerCase();
        const normalizedSpeciesName = speciesName.trim().toLowerCase();
        const normalizedAnimalName = animalName.trim().toLowerCase();

        const zone = await this.getOrCreateZone(normalizedZoneName, zonesCache, queryRunner);
        const specie = await this.getOrCreateSpecies(normalizedSpeciesName, zone, speciesCache, queryRunner);
        await this.getOrCreateAnimal(normalizedAnimalName, specie, animalsCache, queryRunner);
      }

      if (errors.length > 0) {
        await queryRunner.rollbackTransaction();
        const errorBuffer = await this.generateErrorReport(data, errors);
        return { success: false, errorBuffer };
      }

      await queryRunner.commitTransaction();
      return { success: true };

    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw new BadRequestException('Error processing the file: ' + error.message);
    } finally {
      await queryRunner.release();
      fs.unlinkSync(filePath);
    }
  }

  private async getOrCreateZone(normalizedZoneName: string, zonesCache: Map<string, Zone>, queryRunner: any): Promise<Zone> {
    let zone = zonesCache.get(normalizedZoneName);
    if (!zone) {
      zone = (await this.zoneRepository.findOne({ where: { name: normalizedZoneName } })) || undefined;
      if (!zone) {
        zone = this.zoneRepository.create({ name: normalizedZoneName });
        await queryRunner.manager.save(zone);
      }
      zonesCache.set(normalizedZoneName, zone);
    }
    return zone;
  }

  private async getOrCreateSpecies(normalizedSpeciesName: string, zone: Zone, speciesCache: Map<string, Species>, queryRunner: any): Promise<Species> {
    let specie = speciesCache.get(normalizedSpeciesName);
    if (!specie) {
      specie = (await this.speciesRepository.findOne({ where: { name: normalizedSpeciesName, zone: { id: zone.id } } })) || undefined;
      if (!specie) {
        specie = this.speciesRepository.create({ name: normalizedSpeciesName, zone });
        await queryRunner.manager.save(specie);
      }
      speciesCache.set(normalizedSpeciesName, specie);
    }
    return specie;
  }

  private async getOrCreateAnimal(normalizedAnimalName: string, specie: Species, animalsCache: Map<string, Animal>, queryRunner: any): Promise<Animal> {
    let animal = animalsCache.get(normalizedAnimalName);
    if (!animal) {
      animal = (await this.animalRepository.findOne({ where: { name: normalizedAnimalName, specie: { id: specie.id } } })) || undefined;
      if (!animal) {
        animal = this.animalRepository.create({ name: normalizedAnimalName, specie });
        await queryRunner.manager.save(animal);
      }
      animalsCache.set(normalizedAnimalName, animal);
    }
    return animal;
  }

  private async generateErrorReport(data: any[], errors: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Errors');

    // Definir las columnas
    const columns = Object.keys(data[0]).map(key => ({ header: key, key }));
    columns.push({ header: 'error', key: 'error' });

    worksheet.columns = columns;

    // Filtrar datos que realmente existan y agregar errores
    data.forEach((row, index) => {
      if (row.zone || row.specie || row.animal) {  // Solo agregar filas con datos
        const rowData = { ...row, error: errors.find(e => e.row === index + 2)?.error || '' };
        const excelRow = worksheet.addRow(rowData);

        // Resaltar la fila si tiene errores
        if (rowData.error) {
          excelRow.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFCCCC' }  // Color rojo claro para la fila con error
            };
          });
        }
      }
    });

    // Convertir el workbook en un buffer para su descarga
    const excelBuffer = await workbook.xlsx.writeBuffer();
    const nodeBuffer = Buffer.from(excelBuffer);
    return nodeBuffer;
  }
}