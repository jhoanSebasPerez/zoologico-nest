import { Controller, Get, Query, Res } from '@nestjs/common';
import { IndicatorsService } from './indicators.service';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/types';
import { Response } from 'express';

@Controller('indicators')
export class IndicatorsController {
  constructor(private readonly indicatorsService: IndicatorsService) { }

  @Get("/quantity-animals-by-zone")
  @Auth(ValidRoles.ADMIN)
  async getQuantityAnimalsByZone() {
    return await this.indicatorsService.getQuantityAnimalsByZone();
  }

  @Get('reply-percentage')
  @Auth(ValidRoles.ADMIN)
  async getCommentReplyPercentage() {
    return this.indicatorsService.getCommentReplyPercentage();
  }

  @Get('animals-count-by-specie')
  @Auth(ValidRoles.ADMIN)
  async getAnimalCountBySpecies() {
    return this.indicatorsService.getAnimalCountBySpecies();
  }

  @Get('animals-by-date')
  @Auth(ValidRoles.ADMIN)
  async getAnimalsByDate(@Query('date') date: string) {
    return this.indicatorsService.getAnimalsByRegistrationDate(date);
  }

  @Get('search')
  @Auth(ValidRoles.ADMIN)
  async search(@Query('keyword') keyword: string) {
    return this.indicatorsService.search(keyword);
  }

  @Get('report')
  async getIndicatorsReport(@Res() res: Response) {
    const pdfBuffer = await this.indicatorsService.generateIndicatorsReport();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="reporte_indicadores.pdf"',
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}
