import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Cart as CartInterface } from './types/cart.interfaces';
import { ProductService } from './../product/product.service';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { CartItemType } from './types/cart-item.type';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
    private readonly productService: ProductService,
  ) {}

  async getCart(userId: string): Promise<CartDocument | null> {
    try {
      const cart = await this.cartModel.findOne({ userId }).exec();

      if (!cart) {
        throw new NotFoundException(`Cart is empty`);
      }

      return cart;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  private async getProductById(productId: string) {
    const product = await this.productService.findOne(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID: ${productId} not found.`);
    }
    return product;
  }

  private validateStockAvailability(product: any, quantity: number) {
    if (product.stock < quantity) {
      throw new NotFoundException(
        `Insufficient stock for product: ${product.name}`,
      );
    }
  }

  async addToCart(
    userId: string,
    items: CartItemType[],
  ): Promise<CartDocument> {
    try {
      for (const item of items) {
        const { productId, quantity } = item;

        const productExist = await this.getProductById(productId);

        this.validateStockAvailability(productExist, quantity);

        const cart = await this.cartModel.findOneAndUpdate(
          { userId, 'items.productId': productId },
          {
            $inc: { 'items.$.quantity': quantity },
          },
          { new: true },
        );

        if (!cart) {
          // Se o carrinho não existir ou não houver o produto, cria um novo item no carrinho
          await this.cartModel.findOneAndUpdate(
            { userId },
            {
              $push: { items: { productId, quantity } },
            },
            { upsert: true, new: true }, // Cria o carrinho se não existir
          );
        }
      }

      const updatedCart = await this.cartModel.findOne({ userId }).exec();
      return updatedCart;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  private async validateIfCartExistToUser(
    userId: string,
  ): Promise<CartDocument> {
    const cart = await this.cartModel.findOne({ userId });

    if (!cart) {
      throw new NotFoundException(`There is no Cart yet to User ID: ${userId}`);
    }

    return cart;
  }

  private async validateIfProductStillExistInCart(
    userId: string,
    productId: string,
    cart: CartDocument,
  ): Promise<CartDocument> {
    const itemStillExists = cart.items.some(
      (item) => item.productId.toString() === productId,
    );

    if (itemStillExists) {
      throw new Error(
        `Produto ${productId} não foi removido do carrinho do usuário ${userId}.`,
      );
    }

    return cart;
  }

  async removeFromCart(
    userId: string,
    productId: string,
  ): Promise<CartDocument> {
    await this.validateIfCartExistToUser(userId);

    // Remove o produto do carrinho
    const updatedCart = await this.cartModel.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true },
    );

    // Verifica se o produto ainda está no carrinho, utilizando a variável `cart`
    await this.validateIfProductStillExistInCart(
      userId,
      productId,
      updatedCart,
    );

    return updatedCart;
  }

  private validateProductExistsInUserCart(
    cart: CartInterface,
    productId: string,
  ): number {
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (itemIndex === -1) {
      throw new Error(`Product ${productId} was not found in the cart.`);
    }

    return itemIndex;
  }

  private validateAndRemoveIfQuantityIsInvalid(
    cart: CartInterface,
    itemIndex: number,
  ): void {
    const currentQuantity = cart.items[itemIndex].quantity;

    if (currentQuantity <= 0) {
      // Remove o produto se a quantidade for zero ou negativa
      cart.items.splice(itemIndex, 1);
    }
  }

  async decreaseProductQuantity(
    userId: string,
    productId: string,
    quantityToDecrement: number,
  ): Promise<CartDocument> {
    try {
      const cart = await this.validateIfCartExistToUser(userId);

      const itemIndex = this.validateProductExistsInUserCart(cart, productId);

      const updatedCart = await this.cartModel.findOneAndUpdate(
        { userId, 'items.productId': productId },
        {
          $inc: {
            'items.$.quantity': -quantityToDecrement,
          },
        },
        { new: true },
      );

      this.validateAndRemoveIfQuantityIsInvalid(updatedCart, itemIndex);

      await updatedCart.save();

      return updatedCart;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
