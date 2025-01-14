import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsMongoId,
  IsString,
  Min,
  NotEquals,
  ValidateNested,
} from 'class-validator';

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

export class CartDtoSwagger {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItem)
  @ApiProperty({
    description: 'Array of cart items',
    type: [CartItem],
    example: [{ productId: '678610452930aa6cd01ed86a', quantity: 2 }],
  })
  items: CartItem[];
}
