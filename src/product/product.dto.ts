import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProductDTO {
  @IsNotEmpty()
  @IsString()
  readonly originalName: string;

  @IsNotEmpty()
  @IsString()
  readonly commonName: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  readonly price: number;
}

export class UpdateProductDTO {
  @IsOptional()
  @IsString()
  readonly originalName: string;

  @IsOptional()
  @IsString()
  readonly commonName: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  readonly stocks: number;

  @IsOptional()
  readonly image?: any;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  readonly price: number;
}
