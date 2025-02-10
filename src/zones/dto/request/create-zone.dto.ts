import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateZoneDto {

    @IsString()
    @MinLength(1)
    @MaxLength(50)
    name: string;
}
