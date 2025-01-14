import { Injectable, NotFoundException } from '@nestjs/common';

import { Model } from 'mongoose';
import { CartService } from './../cart/cart.service';
import { ProductService } from './../product/product.service';
import { InjectModel } from '@nestjs/mongoose';
import { Purchase, PurchaseDocument } from './schemas/purchase.schema';

import { CartItem } from 'src/cart/dto/cart-item.dto';
import { CartDocument } from 'src/cart/schemas/cart.schema';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectModel(Purchase.name)
    private purchaseModel: Model<PurchaseDocument>,
    private readonly cartService: CartService,
    private readonly productService: ProductService,
  ) {}

  async checkout(userId: string): Promise<PurchaseDocument> {
    try {
      const cart = await this.getCartWithValidation(userId);

      const items = await this.processCartItems(cart.items);

      const total = this.calculateTotal(items);

      const purchase = await this.createPurchase(userId, items, total);

      await this.clearCart(cart.items, userId);

      return purchase;
    } catch (error) {
      this.handleCheckoutError(error);
    }
  }

  private async getCartWithValidation(userId: string): Promise<CartDocument> {
    const cart = await this.cartService.getCart(userId);

    if (!cart || cart.items.length === 0) {
      throw new NotFoundException('Cart is empty');
    }

    return cart;
  }

  private async processCartItems(cartItems: CartItem[]): Promise<any> {
    return Promise.all(
      cartItems.map(async (item) => {
        const product = await this.validateAndUpdateProductStock(item);
        return {
          productId: product._id,
          quantity: item.quantity,
          price: product.price,
        };
      }),
    );
  }

  private async validateAndUpdateProductStock(item: CartItem): Promise<any> {
    const product = await this.productService.findOne(item.productId);

    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for product: ${product.name}`);
    }

    product.stock -= item.quantity;
    await product.save();

    return product;
  }

  private calculateTotal(items: any): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  private async createPurchase(
    userId: string,
    items: CartItem,
    total: number,
  ): Promise<PurchaseDocument> {
    return this.purchaseModel.create({
      userId,
      items,
      total,
    });
  }

  private async clearCart(
    cartItems: CartItem[],
    userId: string,
  ): Promise<void> {
    for (const item of cartItems) {
      await this.cartService.removeFromCart(userId, item.productId);
    }
  }

  private handleCheckoutError(error: unknown): never {
    if (error instanceof NotFoundException) {
      throw new Error('Cart is empty');
    }
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }

  async getPurchaseStatistics(userId: string): Promise<any> {
    return {
      totalSales: await this.getTotalSales(userId),
      totalProductsSold: await this.getTotalProductsSold(userId),
      topSellingProducts: await this.getTopSellingProducts(userId),
      allSoldProducts: await this.getAllSoldProducts(userId),
    };
  }

  private async getTotalSales(userId: string): Promise<number> {
    const totalSales = await this.purchaseModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
        },
      },
    ]);

    return totalSales[0]?.totalSales || 0;
  }

  private async getTotalProductsSold(userId: string): Promise<number> {
    const totalProductsSold = await this.purchaseModel.aggregate([
      { $match: { userId } },
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$items.quantity' },
        },
      },
    ]);

    return totalProductsSold[0]?.totalQuantity || 0;
  }

  private async getTopSellingProducts(userId: string): Promise<any[]> {
    const topSellingProducts = await this.purchaseModel.aggregate([
      { $match: { userId } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    return Promise.all(
      topSellingProducts.map(async (product) => {
        const productDetails = await this.productService.findOne(product._id);

        return {
          productId: product._id,
          productName: productDetails?.name || 'Unknown Product',
          totalSold: product.totalSold,
        };
      }),
    );
  }

  private async getAllSoldProducts(userId: string): Promise<any[]> {
    const purchases = await this.purchaseModel.find({ userId });
    const allSoldProducts = [];

    for (const purchase of purchases) {
      for (const item of purchase.items) {
        const productDetails = await this.productService.findOne(
          item.productId,
        );

        allSoldProducts.push({
          productId: item.productId,
          productName: productDetails?.name || 'Unknown Product',
          quantity: item.quantity,
          price: item.price,
        });
      }
    }

    return allSoldProducts;
  }
}
