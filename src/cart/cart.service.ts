import { Inject, Injectable } from '@nestjs/common';
import { Cart as CartInterface } from './interfaces/cart.interfaces';
import { CartDto } from './dto/cart.dto';

import { Model } from 'mongoose';

@Injectable()
export class CartService {
  constructor(
    @Inject('CART_MODEL')
    private cartModel: Model<CartInterface>,
  ) {}

  async addToCart(cartDto: CartDto): Promise<CartInterface> {
    const cart = await this.cartModel.findOne({ userId: cartDto.userId });
    if (cart) {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId === productId,
      );
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
      return cart.save();
    } else {
      const newCart = new this.cartModel({
        userId,
        items: [{ productId, quantity }],
      });
      return newCart.save();
    }
  }

  async removeFromCart(
    userId: string,
    productId: string,
  ): Promise<CartInterface> {
    const cart = await this.cartModel.findOne({ userId });
    if (cart) {
      cart.items = cart.items.filter((item) => item.productId !== productId);
      return cart.save();
    }
    return null;
  }

  async getCart(userId: string): Promise<CartInterface> {
    return this.cartModel.findOne({ userId }).exec();
  }
}
