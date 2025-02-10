import { IsString, IsUUID, MinLength } from "class-validator";

export class UpdateAnimalDto {
    @IsString()
    @MinLength(1)
    name: string;

    @IsUUID()
    specieId: string;
}