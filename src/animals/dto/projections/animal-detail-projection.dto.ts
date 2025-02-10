export class AnimalDetailProjectionDto {
    id: string;
    name: string;
    createdAt: Date;
    especie: {
        id: string;
        name: string;
    };
}