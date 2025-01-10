import { Model } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { Cart as CartInterface } from './interfaces/cart.interfaces';

// interface CartItem {
//   productId: string; // ID do produto
//   quantity: number; // Quantidade do produto
// }

// interface Cart {
//   userId: string; // ID do usuário
//   items: CartItem[]; // Itens no carrinho
//   save: () => Promise<Cart>; // Método para salvar o carrinho no banco
// }

// interface AddToCartInput {
//   productId: string;
//   quantity: number;
// }

@Injectable()
export class CartService {
  constructor(
    @Inject('CART_MODEL')
    private readonly cartModel: Model<CartInterface>,
  ) {}

  async addToCart(
    userId: string,
    items: { productId: string; quantity: number }[],
  ) {
    for (const item of items) {
      const { productId, quantity } = item;
      console.log(productId, quantity);

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
    }

    // Para cada item, atualize ou adicione no carrinho
    for (const item of items) {
      const { productId, quantity } = item;

      // Tenta atualizar o item no carrinho, se não encontrar, adiciona o item
      const cart = await this.cartModel.findOneAndUpdate(
        { userId, 'items.productId': productId }, // Procurar carrinho do usuário com o produto
        {
          $inc: { 'items.$.quantity': quantity }, // Incrementa a quantidade do item
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
    const updatedCart = await this.cartModel.findOne({ userId });
    return updatedCart;
  }

  // async addToCart(
  //   userId: string,
  //   items: { productId: string; quantity: number }[],
  // ) {
  //   // Validar cada item recebido
  //   for (const item of items) {
  //     const { productId, quantity } = item;
  //     console.log(productId, quantity);

  //     if (
  //       !productId ||
  //       typeof productId !== 'string' ||
  //       productId.trim().length === 0
  //     ) {
  //       throw new Error('Inserir ID válido');
  //     }

  //     if (typeof quantity !== 'number' || quantity <= 0) {
  //       throw new Error('A quantidade deve ser um número positivo');
  //     }
  //   }

  //   // Procurar o carrinho do usuário
  //   let cart = await this.cartModel.findOne({ userId });
  //   console.log(cart);

  //   if (cart) {
  //     // Atualizar ou adicionar itens no carrinho existente
  //     for (const item of items) {
  //       const { productId, quantity } = item;

  //       const itemIndex = cart.items.findIndex(
  //         (cartItem) => cartItem.productId === productId,
  //       );

  //       if (itemIndex > -1) {
  //         // Se o produto já existe, atualize a quantidade
  //         cart.items[itemIndex].quantity += quantity;
  //       } else {
  //         // Caso contrário, adicione o novo item
  //         cart.items.push({ productId, quantity });
  //       }
  //     }
  //     // Salvar as alterações no carrinho apenas uma vez
  //     await cart.save();
  //   } else {
  //     // Criar novo carrinho se ainda não existir
  //     cart = new this.cartModel({
  //       userId,
  //       items,
  //     });
  //     await cart.save(); // Salvar o novo carrinho
  //   }

  //   return cart;
  // }

  async removeFromCart(
    userId: string,
    productId: string,
  ): Promise<CartInterface | string> {
    if (!userId || !productId) {
      throw new Error('Invalid userId or productId');
    }

    // Remover o item do array usando findOneAndUpdate
    const cart = await this.cartModel.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true }, // Retorna o carrinho atualizado
    );

    // Verificar se o carrinho foi encontrado
    if (!cart) {
      return `Carrinho não encontrado para o usuário especificado ${userId}.`;
    }

    // Verificar se o produto foi removido
    const itemStillExists = cart.items.some(
      (item) => item.productId.toString() === productId,
    );

    if (itemStillExists) {
      return `Produto ${productId} não foi removido do carrinho do usuário ${userId}.`;
    }

    return cart;
  }

  async decreaseProductQuantity(
    userId: string,
    productId: string,
    quantityToDecrement: number,
  ): Promise<CartInterface | string> {
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
      return `Produto ou Carrinho não encontrado para o usuário ${userId}.`;
    }

    // Verificar se o produto existe no carrinho
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (itemIndex === -1) {
      return `Produto ${productId} não encontrado no carrinho do usuário ${userId}.`;
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

  async getCart(userId: string): Promise<CartInterface> {
    return this.cartModel.findOne({ userId }).exec();
  }
}
