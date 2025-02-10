import { IsString, IsUUID, MinLength } from "class-validator";

export class CreateSpeciesDto {

    @IsString()
    @MinLength(1)
    name: string;

    @IsUUID()
    zoneId: string;
}
