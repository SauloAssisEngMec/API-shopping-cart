import { IsArray, IsString } from 'class-validator';
import { CartItemType } from '../types/cart-item.type';

export class CartDto {
  @IsString()
  readonly userId: string;
  @IsArray()
  items: CartItemType[];
}
