import { Controller, Post, Body, Get, Query, Param, Delete, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { SpeciesService } from './species.service';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/types';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';

@Controller('species')
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) { }

  @Post()
  @Auth(ValidRoles.ADMIN)
  async create(@Body() createSpeciesDto: CreateSpeciesDto) {
    const specie = await this.speciesService.create(createSpeciesDto);
    return {
      id: specie.id,
      name: specie.name,
      zone: {
        id: specie.zone.id,
        name: specie.zone.name
      }
    }
  }

  @Get()
  @Auth(ValidRoles.ADMIN, ValidRoles.EMPLOYEE)
  async findAll(@Query() query: PaginationQueryDto) {
    return this.speciesService.findAllSpecies(query);
  }

  @Get(":id")
  @Auth(ValidRoles.ADMIN, ValidRoles.EMPLOYEE)
  async findSpecieById(@Param('id') id: string) {
    return await this.speciesService.findSpecieById(id);
  }

  @Put(":id")
  @Auth(ValidRoles.ADMIN)
  async updateSpecie(
    @Param('id') id: string,
    @Body() updateSpecieDto: UpdateSpeciesDto
  ) {
    return await this.speciesService.updateSpecie(id, updateSpecieDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth(ValidRoles.ADMIN)
  async deleteById(
    @Param('id') id: string
  ) {
    return this.speciesService.deleteById(id);
  }

}
