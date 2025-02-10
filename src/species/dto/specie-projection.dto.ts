export class SpeciesProjectionDto {
    id: string;
    name: string;
    zone: {
        id: string;
        name: string;
    };
    countOfAnimals: number;
}
