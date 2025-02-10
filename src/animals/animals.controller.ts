import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { AnimalsService } from './animals.service';
import { CreateAnimalDto } from './dto/request/create-animal.dto';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/types';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { UpdateAnimalDto } from './dto/request/update-animal.dto';

@Controller('animals')
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) { }

  @Post()
  @Auth(ValidRoles.ADMIN)
  async create(@Body() createAnimalDto: CreateAnimalDto) {
    return this.animalsService.create(createAnimalDto);
  }

  @Get()
  @Auth(ValidRoles.ADMIN, ValidRoles.EMPLOYEE)
  async findAll(@Query() query: PaginationQueryDto) {
    return this.animalsService.findAllAnimals(query);
  }

  @Get("/:id")
  @Auth(ValidRoles.ADMIN, ValidRoles.EMPLOYEE)
  async findById(@Param('id') id: string) {
    return this.animalsService.findById(id);
  }

  @Get("/:id/comments")
  @Auth(ValidRoles.ADMIN, ValidRoles.EMPLOYEE)
  async getComments(@Param('id') id: string) {
    return this.animalsService.getAnimalComments(id);
  }

  @Put("/:id")
  @Auth(ValidRoles.ADMIN)
  async updateById(
    @Param('id') id: string,
    @Body() updateAnimalDto: UpdateAnimalDto
  ) {
    return this.animalsService.updateById(id, updateAnimalDto);
  }

  @Delete("/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth(ValidRoles.ADMIN)
  async deleteById(
    @Param('id') id: string
  ) {
    return this.animalsService.deleteById(id);
  }
}