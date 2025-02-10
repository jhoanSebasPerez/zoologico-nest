import { Controller, Post, Body, Get, Query, Param, Delete, HttpCode, Put } from '@nestjs/common';
import { ZonesService } from './zones.service';
import { CreateZoneDto } from './dto';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/types';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

@Controller('zones')
export class ZonesController {

  constructor(private readonly zonesService: ZonesService) { }

  @Post()
  @Auth(ValidRoles.ADMIN)
  create(@Body() createZoneDto: CreateZoneDto) {
    return this.zonesService.create(createZoneDto);
  }

  @Get()
  @Auth(ValidRoles.ADMIN, ValidRoles.EMPLOYEE)
  findAll(@Query() query: PaginationQueryDto) {
    return this.zonesService.findAllZones(query);
  }

  @Get("/:id")
  @Auth(ValidRoles.ADMIN, ValidRoles.EMPLOYEE)
  findZone(@Param('id') id: string) {
    return this.zonesService.findZoneDetailById(id);

  }

  @Put("/:id")
  @Auth(ValidRoles.ADMIN)
  async update(@Param('id') id: string, @Body() updateZoneDto: CreateZoneDto) {
    return this.zonesService.updateZone(id, updateZoneDto);
  }

  @Delete("/:id")
  @HttpCode(204)
  @Auth(ValidRoles.ADMIN)
  async delete(@Param('id') id: string) {
    return this.zonesService.deleteZone(id);
  }


}
