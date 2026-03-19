import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateRoleDTO {
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value.toLowerCase())
    readonly name: string
}