import { IsString, IsUUID, MinLength } from "class-validator";

export class UpdateSpeciesDto {

    @IsString()
    @MinLength(1)
    name: string;

    @IsUUID()
    zoneId: string;
}