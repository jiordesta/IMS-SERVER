import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class ItemOrderDTO {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  readonly productId: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  readonly quantity: number;
}

export class CreateOrderDTO {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  readonly shopId: number;

  @IsNotEmpty()
  readonly orderDate: Date;

  @IsNotEmpty()
  items: ItemOrderDTO[];
}

export class UpdateOrderDTO {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  readonly shopId?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  readonly status?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  readonly type?: number;

  @IsOptional()
  readonly orderDate?: Date;

  @IsOptional()
  items?: ItemOrderDTO[];
}

export class FetchOrdersByDateDTO {
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  readonly date: Date;
}
