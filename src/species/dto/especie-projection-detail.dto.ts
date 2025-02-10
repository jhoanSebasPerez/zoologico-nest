export class SpecieProjectionDetailDto {
    id: string;
    name: string;
    zone: {
        id: string;
        name: string;
    };
    animals: {
        id: string;
        name: string;
    }[];
}