import { IsArray, IsString } from 'class-validator';
import { CartItemType } from '../types/cart-item.type';
import { ApiProperty } from '@nestjs/swagger';

export class CartDto {
  @IsString()
  @ApiProperty()
  userId: string;

  @IsArray()
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
  items: CartItemType[];
}
