import { IsString, IsUUID, MinLength } from "class-validator";

export class CreateAnimalDto {

    @IsString()
    @MinLength(1)
    name: string;

    @IsUUID()
    specieId: string;

}
