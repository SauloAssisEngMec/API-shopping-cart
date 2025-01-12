import { ApiProperty } from '@nestjs/swagger';

export class CartItem {
  @ApiProperty({ description: 'product ID from cart ' })
  productId: string;

  @ApiProperty({ description: 'cart quantity' })
  quantity: number;
}
