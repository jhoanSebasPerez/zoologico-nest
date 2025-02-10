import { Injectable } from '@nestjs/common';
import { AnimalsService } from 'src/animals/animals.service';
import { CommentsService } from 'src/comments/comments.service';
import { SpeciesService } from 'src/species/species.service';
import { ZonesService } from 'src/zones/zones.service';
import { generatePdfReport } from './utils/pdf-generator';

@Injectable()
export class IndicatorsService {

  constructor(
    private readonly zoneService: ZonesService,
    private readonly commentService: CommentsService,
    private readonly speciesService: SpeciesService,
    private readonly animalService: AnimalsService
  ) { }

  async getQuantityAnimalsByZone() {
    const quantity = await this.zoneService.getAnimalsCountByZone();
    return quantity;
  }

  async getCommentReplyPercentage() {
    const percentage = await this.commentService.getCommentReplyPercentage();
    return percentage;
  }

  async getAnimalCountBySpecies() {
    const count = await this.speciesService.getAnimalCountBySpecies();
    return count;
  }

  async getAnimalsByRegistrationDate(date: string) {
    const animals = await this.animalService.getAnimalsByRegistrationDate(date);
    return animals;
  }

  async search(keyword: string) {
    if (!keyword || keyword.trim().length === 0) {
      return [];
    }
    const zones = await this.zoneService.searchZones(keyword);
    const animals = await this.animalService.searchAnimals(keyword);
    const comments = await this.commentService.searchComments(keyword);

    return { zones, animals, comments };
  }

  async generateIndicatorsReport(): Promise<Buffer> {
    const animalsByZone = await this.zoneService.getAnimalsCountByZone();
    const animalsBySpecies = await this.speciesService.getAnimalCountBySpecies();
    const commentReplyPercentage = await this.commentService.getCommentReplyPercentage();

    return generatePdfReport(animalsByZone, animalsBySpecies, commentReplyPercentage);
  }
}
