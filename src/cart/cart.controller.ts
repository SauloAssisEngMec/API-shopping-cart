import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  Query,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CartItemType } from './types/cart-item.type';
import { CartItem } from './dto/cart-item.dto';

@Controller('cart')
@ApiTags('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

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
  async addToCart(
    @Param('userId') userId: string,
    @Body() items: CartItemType[],
  ): Promise<any> {
    return this.cartService.addToCart(userId, items);
  }

  @Delete(':userId/remove/:productId')
  async removeFromCart(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeFromCart(userId, productId);
  }

  @Delete(':userId/decrease/:productId')
  async decreaseProductQuantity(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
    @Query('quantity') quantityToDecrement: number, // quantidade a ser decrementada, fornecida como query parameter
  ) {
    // Verificar se a quantidade fornecida é válida
    if (quantityToDecrement <= 0) {
      throw new Error('Is not a válid quantity');
    }

    // Chama o serviço que faz a lógica de decremento
    return this.cartService.decreaseProductQuantity(
      userId,
      productId,
      quantityToDecrement,
    );
  }

  @Get(':userId')
  async getCart(@Param('userId') userId: string) {
    return this.cartService.getCart(userId);
  }
}
