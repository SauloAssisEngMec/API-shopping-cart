import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsMongoId, IsString, Min, NotEquals } from 'class-validator';

export class CartItem {
  @IsString()
  @IsMongoId({ message: 'Invalid ID' })
  @ApiProperty({ description: 'product ID from cart ' })
  productId: string;

  @IsInt()
  @NotEquals(0)
  @Min(1)
  @ApiProperty({ description: 'cart quantity' })
  quantity: number;
}
