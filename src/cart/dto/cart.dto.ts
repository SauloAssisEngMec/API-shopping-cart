import { IsArray, ValidateNested } from 'class-validator';
import { CartItemType } from '../types/cart-item.type';
import { ApiProperty } from '@nestjs/swagger';
import { CartItem } from './cart-item.dto';
import { Type } from 'class-transformer';

export class CartDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
        quantity: { type: 'number' },
      },
    },
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItem)
  items: CartItemType[];
}
