import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ProductDto {
  // name: string;
  // description: string;
  // price: number;
  // stock: number;
  // productCategory: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  price: number;

  @IsNumber()
  stock: number;

  @IsString()
  @IsNotEmpty()
  productCategory: string;
}
