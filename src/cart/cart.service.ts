import { Model, Types } from 'mongoose';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cart as CartInterface } from './types/cart.interfaces';
import { ProductService } from './../product/product.service';
import { InjectModel } from '@nestjs/mongoose';
import { Cart } from './schemas/cart.schema';
import { CartItemType } from './types/cart-item.type';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartInterface>,
    private readonly productService: ProductService,
  ) {}

  async getCart(userId: string): Promise<CartInterface> {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('ID invalid');
    }
    return this.cartModel.findOne({ userId }).exec();
  }

  async addToCart(userId: string, items: CartItemType[]) {
    for (const item of items) {
      const { productId, quantity } = item;

      // Inputs Validation
      if (
        !productId ||
        typeof productId !== 'string' ||
        productId.trim().length === 0
      ) {
        throw new Error('Inserir ID válido');
      }

      if (typeof quantity !== 'number' || quantity <= 0) {
        throw new Error('A quantidade deve ser um número positivo');
      }

      // Check if the product exists in stock
      if (!Types.ObjectId.isValid(productId)) {
        throw new BadRequestException(`Invalid ID: ${productId}`);
      }
      const checkProductStock = await this.productService.findOne(productId);
      console.log(checkProductStock);

      if (!checkProductStock) {
        throw new Error(`Produto com ID ${productId} não encontrado.`);
      }
      if (checkProductStock.stock < quantity) {
        throw new Error(
          `Insufficient stock for product: ${checkProductStock.name}`,
        );
      }
    }

    // Para cada item, atualize ou adicione no carrinho
    for (const item of items) {
      const { productId, quantity } = item;

      // Tenta atualizar o item no carrinho, se não encontrar, adiciona o item
      const cart = await this.cartModel.findOneAndUpdate(
        { userId, 'items.productId': productId },
        {
          $inc: { 'items.$.quantity': quantity },
        },
        { new: true }, // Retorna o documento atualizado
      );

      if (!cart) {
        // Se o carrinho não existir ou não houver o produto, cria um novo item no carrinho
        await this.cartModel.findOneAndUpdate(
          { userId }, // Procura pelo carrinho do usuário
          {
            $push: { items: { productId, quantity } }, // Adiciona novo item
          },
          { upsert: true, new: true }, // Cria o carrinho se não existir
        );
      }
    }

    // Retorna o carrinho atualizado
    const updatedCart = await this.cartModel.findOne({ userId }).exec();
    return updatedCart;
  }

  async removeFromCart(
    userId: string,
    productId: string,
  ): Promise<CartInterface> {
    if (!userId || !productId) {
      throw new BadRequestException('Invalid userId or productId');
    }

    const cart = await this.cartModel.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true },
    );

    if (!cart) {
      throw new NotFoundException(
        `Carrinho não encontrado para o usuário especificado ${userId}.`,
      );
    }

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

  // async decreaseProductQuantity(
  //   userId: string,
  //   productId: string,
  //   quantityToDecrement: number,
  // ): Promise<CartInterface | string> {
  //   if (quantityToDecrement <= 0) {
  //     throw new Error(
  //       'A quantidade a ser decrementada deve ser um número positivo.',
  //     );
  //   }

  //   // Encontrar o carrinho do usuário e tentar atualizar a quantidade do item
  //   const cart = await this.cartModel.findOneAndUpdate(
  //     { userId, 'items.productId': productId }, // Filtro para garantir que estamos atualizando o carrinho certo
  //     {
  //       $inc: {
  //         'items.$.quantity': -quantityToDecrement, // Decrementa a quantidade do item
  //       },
  //     },
  //     { new: true }, // Retorna o carrinho atualizado
  //   );

  //   // Verificar se o carrinho foi encontrado
  //   if (!cart) {
  //     return `Produto ou Carrinho não encontrado para o usuário ${userId}.`;
  //   }

  //   // Verificar se o produto existe no carrinho
  //   const itemIndex = cart.items.findIndex(
  //     (item) => item.productId.toString() === productId,
  //   );

  //   if (itemIndex === -1) {
  //     return `Produto ${productId} não encontrado no carrinho do usuário ${userId}.`;
  //   }

  //   // Verificar se a quantidade não ficou negativa
  //   const currentQuantity = cart.items[itemIndex].quantity;

  //   if (currentQuantity <= 0) {
  //     // Se a quantidade for zero ou negativa, remover o item do carrinho
  //     cart.items.splice(itemIndex, 1); // Remove o item do array de items

  //     // Salvar as mudanças no carrinho
  //     await cart.save();

  //     // Retornar o carrinho atualizado
  //     return cart;
  //   }

  //   // Caso a quantidade tenha sido decrementada com sucesso e o produto ainda tenha quantidade > 0
  //   await cart.save(); // Salva o carrinho atualizado
  //   return cart;
  // }
  async decreaseProductQuantity(
    userId: string,
    productId: string,
    quantityToDecrement: number,
  ): Promise<CartInterface> {
    if (quantityToDecrement <= 0) {
      throw new Error(
        'A quantidade a ser decrementada deve ser um número positivo.',
      );
    }

    // Encontrar o carrinho do usuário e tentar atualizar a quantidade do item
    const cart = await this.cartModel.findOneAndUpdate(
      { userId, 'items.productId': productId }, // Filtro para garantir que estamos atualizando o carrinho certo
      {
        $inc: {
          'items.$.quantity': -quantityToDecrement, // Decrementa a quantidade do item
        },
      },
      { new: true }, // Retorna o carrinho atualizado
    );

    // Verificar se o carrinho foi encontrado
    if (!cart) {
      throw new Error(`Cart was not found for user ${userId}.`);
    }

    // Verificar se o produto existe no carrinho
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (itemIndex === -1) {
      throw new Error(`Product ${productId} was not found for user ${userId}.`);
    }

    // Verificar se a quantidade não ficou negativa
    const currentQuantity = cart.items[itemIndex].quantity;

    if (currentQuantity <= 0) {
      // Se a quantidade for zero ou negativa, remover o item do carrinho
      cart.items.splice(itemIndex, 1); // Remove o item do array de items

      // Salvar as mudanças no carrinho
      await cart.save();

      // Retornar o carrinho atualizado
      return cart;
    }

    // Caso a quantidade tenha sido decrementada com sucesso e o produto ainda tenha quantidade > 0
    await cart.save(); // Salva o carrinho atualizado
    return cart;
  }
}
