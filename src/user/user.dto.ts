import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class CreateUserRoleDTO {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  readonly roleId: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  readonly userId: number;
}

export class UpdateUserDTO {}

export class AssignUserRoleDTO {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  readonly roleId: number;
}
