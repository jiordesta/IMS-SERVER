import { IsNotEmpty, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class RegisterUserDTO {
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value.toLowerCase())
    readonly username: string;

    @IsNotEmpty()
    @IsString()
    readonly password: string;

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value.toLowerCase())
    readonly fname: string;

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value.toLowerCase())
    readonly lname: string;

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value.toLowerCase())
    readonly nname: string;
}

export class LoginDTO {
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value.toLowerCase())
    readonly username: string;

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value.toLowerCase())
    readonly password: string;
}