import { IsArray, IsString, MinLength } from "class-validator";
import { IsValidRole } from "../../validators/rol-constraint.validator";

export class UserUpdateDto {
    @IsString()
    @MinLength(1)
    email: string;

    @IsString()
    @MinLength(1)
    fullName: string;

    @IsArray()
    @IsValidRole()
    roles: string[];
}