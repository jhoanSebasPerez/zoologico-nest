import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(1)
    fullName: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d|.*\W).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password: string;
}
