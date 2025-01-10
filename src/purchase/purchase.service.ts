import { Inject, Injectable } from '@nestjs/common';
import { Purchase as PurchaseInterface } from './interfaces/purchase.interface';
import { Model } from 'mongoose';
import { CartService } from './../cart/cart.service';
import { ProductService } from './../product/product.service';

@Injectable()
export class PurchaseService {
  constructor(
    @Inject('PURCHASE_MODEL')
    private purchaseModel: Model<PurchaseInterface>,
    private readonly cartService: CartService,
    private readonly productService: ProductService,
  ) {}

  async checkout(userId: string): Promise<PurchaseInterface> {
    const cart = await this.cartService.getCart(userId);

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const items = await Promise.all(
      cart.items.map(async (item) => {
        const product = await this.productService.findOne(item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        // Reduce stock
        product.stock -= item.quantity;
        await product.save();

        return {
          productId: product._id,
          quantity: item.quantity,
          price: product.price,
        };
      }),
    );

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Save purchase
    const purchase = new this.purchaseModel({ userId, items, total });
    await purchase.save();

    // Clear cart
    for (const item of cart.items) {
      await this.cartService.removeFromCart(userId, item.productId);
    }

    return purchase;
  }

  // async getPurchaseStatistics(userId: string): Promise<any> {
  //   // Total de vendas para o usuário específico
  //   const totalSales = await this.purchaseModel.aggregate([
  //     { $match: { userId } }, // Filtra pelo userId
  //     {
  //       $group: {
  //         _id: null,
  //         totalSales: { $sum: '$total' },
  //       },
  //     },
  //   ]);

  //   // Quantidade total de produtos vendidos para o usuário específico
  //   const totalProductsSold = await this.purchaseModel.aggregate([
  //     { $match: { userId } }, // Filtra pelo userId
  //     { $unwind: '$items' },
  //     {
  //       $group: {
  //         _id: null,
  //         totalQuantity: { $sum: '$items.quantity' },
  //       },
  //     },
  //   ]);

  //   // Produtos mais vendidos para o usuário específico
  //   const topSellingProducts = await this.purchaseModel.aggregate([
  //     { $match: { userId } }, // Filtra pelo userId
  //     { $unwind: '$items' },
  //     {
  //       $group: {
  //         _id: '$items.productId',
  //         totalSold: { $sum: '$items.quantity' },
  //       },
  //     },
  //     { $sort: { totalSold: -1 } },
  //     { $limit: 5 }, // Limita aos 5 produtos mais vendidos
  //   ]);

  //   // Combina as estatísticas e retorna
  //   return {
  //     totalSales: totalSales[0]?.totalSales || 0,
  //     totalProductsSold: totalProductsSold[0]?.totalQuantity || 0,
  //     topSellingProducts,
  //   };
  // }
  async getPurchaseStatistics(userId: string): Promise<any> {
    // Total de vendas para o usuário específico
    const totalSales = await this.purchaseModel.aggregate([
      { $match: { userId } }, // Filtra pelo userId
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
        },
      },
    ]);

    // Quantidade total de produtos vendidos para o usuário específico
    const totalProductsSold = await this.purchaseModel.aggregate([
      { $match: { userId } }, // Filtra pelo userId
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$items.quantity' },
        },
      },
    ]);

    // Produtos mais vendidos para o usuário específico
    const topSellingProducts = await this.purchaseModel.aggregate([
      { $match: { userId } }, // Filtra pelo userId
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }, // Limita aos 5 produtos mais vendidos
    ]);

    // Buscar informações detalhadas dos produtos mais vendidos
    const populatedTopSellingProducts = await Promise.all(
      topSellingProducts.map(async (product) => {
        const productDetails = await this.productService.findOne(product);

        return {
          productId: product._id,
          productName: productDetails?.name || 'Unknown Product',
          totalSold: product.totalSold,
        };
      }),
    );

    // Lista de todos os livros vendidos
    const purchases = await this.purchaseModel.find({ userId }).lean();
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

    // Combina as estatísticas e retorna
    return {
      totalSales: totalSales[0]?.totalSales || 0,
      totalProductsSold: totalProductsSold[0]?.totalQuantity || 0,
      topSellingProducts: populatedTopSellingProducts,
      allSoldProducts,
    };
  }
}
