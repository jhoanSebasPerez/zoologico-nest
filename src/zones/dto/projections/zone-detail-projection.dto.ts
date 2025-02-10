export class ZoneProjectionDetailDto {
    id: string;
    name: string;
    species: {
        id: string;
        name: string;
    }[]
    createdAt: Date;
}
