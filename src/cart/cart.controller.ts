import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  Query,
  Patch,
} from '@nestjs/common';
import { CartService } from './cart.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CartItem } from './dto/cart-item.dto';
import { CartDto } from './dto/cart.dto';

import { CartType } from './types/cart.type';

@Controller('cart')
@ApiTags('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':userId')
  @ApiOperation({
    summary: 'Get shopping cart for a given user',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to be added',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Cart returned successfully.',
    type: CartDto,
  })
  @ApiResponse({
    status: 400,
    description: 'invalid ID or use dont have a cart with product yet.',
  })
  async getCart(@Param('userId') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post(':userId/add')
  @ApiOperation({ summary: 'Add items to the cart for a given user' })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to be added',
    type: String,
  })
  @ApiBody({
    description: 'Array of cart items to be added',
    type: [CartItem],
  })
  @ApiResponse({
    status: 201,
    description: 'Product was Added to Cart successfully.',
    type: CartDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid userId or Body inputs.' })
  async addToCart(
    @Param('userId') userId: string,
    @Body() cart: CartDto,
  ): Promise<CartType> {
    return this.cartService.addToCart(userId, cart.items);
  }

  @Delete(':userId/remove/:productId')
  @ApiOperation({
    summary: 'remove  products from the cart for a given user (all quantity)',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to be added',
    type: String,
  })
  @ApiParam({
    name: 'productId',
    description: 'product ID to be added',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Product successfully removed form cart.',
    type: CartDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cart or product was not found.',
  })
  async removeFromCart(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeFromCart(userId, productId);
  }

  @Patch(':userId/decrease/:productId')
  @ApiOperation({
    summary: 'Decrease product quantity from the cart for a given user',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to be added',
    type: String,
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ID to be added',
    type: String,
  })
  @ApiQuery({
    description: 'Quantity to be decrease',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Quantity was decreased successfully.',
    type: CartDto,
  })
  @ApiResponse({ status: 400, description: 'invalid Quantity' })
  async decreaseProductQuantity(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
    @Query('quantity') quantityToDecrement: number,
  ) {
    if (quantityToDecrement <= 0) {
      throw new Error('Is not a válid quantity');
    }

    return this.cartService.decreaseProductQuantity(
      userId,
      productId,
      quantityToDecrement,
    );
  }
}
