import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDeliveryDetailsDTO {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  readonly productId: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  readonly quantity: number;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  readonly deliveryDate: Date;

  @IsOptional()
  @IsString()
  readonly brand?: string;
}
