import { IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CreateCommentDto {

    @IsString()
    @MinLength(1)
    @MaxLength(255)
    content: string;

    @IsUUID()
    animalId: string;
}
