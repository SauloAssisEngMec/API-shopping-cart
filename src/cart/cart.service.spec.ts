import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getModelToken } from '@nestjs/mongoose';
import { Cart } from './schemas/cart.schema';
import { ProductService } from './../product/product.service';
import { CartType } from './types/cart.type';
import { Types } from 'mongoose';

const mockCart: CartType = {
  userId: '1',
  items: [
    {
      productId: '5f8d0d55b54764421b7156f0',
      quantity: 2,
    },
  ],
};

const mockProduct = {
  _id: '5f8d0d55b54764421b7156f0',
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  stock: 10,
  productCategory: 'Test Category',
};

const mockProductService = {
  findOne: jest.fn().mockResolvedValue(mockProduct),
};

const mockCartModel = {
  findOne: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockCart),
  }),
  findOneAndUpdate: jest.fn().mockResolvedValue(mockCart),

  create: jest.fn().mockResolvedValue(mockCart),
};

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getModelToken(Cart.name),
          useValue: mockCartModel,
        },
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCart', () => {
    it('should return a cart for the user', async () => {
      const result = await service.getCart('1');
      expect(result).toEqual(mockCart);
      expect(mockCartModel.findOne).toHaveBeenCalledWith({ userId: '1' });
      expect(mockCartModel.findOne).toHaveBeenCalledTimes(1);
    });

    // it('should return a cart for the user', async () => {
    //   // Mockando a função findOne normalmente
    //   //mockCartModel.findOne.mockResolvedValue(mockCart);

    //   // Agora, mockando o populate apenas para este teste
    //   const mockFindOneWithPopulate =
    //     mockCartModel.findOne.mockImplementationOnce(() => ({
    //       ...mockCartModel.findOne(),
    //       populate: jest.fn().mockReturnValueOnce({
    //         ...mockCart,
    //         items: mockCart.items.map((item) => ({
    //           ...item,
    //           productId: { ...item.productId, name: 'Mocked Product' }, // Mock do productId
    //         })),
    //       }),
    //     }));

    //   const result = await service.getCart('1');

    //   // Verificando o retorno do cart
    //   expect(result).toEqual(mockCart);

    //   // Verificando se findOne foi chamado com o userId correto
    //   expect(mockCartModel.findOne).toHaveBeenCalledWith({ userId: '1' });
    //   expect(mockCartModel.findOne).toHaveBeenCalledTimes(1);

    //   // Verificando se a função populate foi chamada corretamente
    //   expect(mockFindOneWithPopulate().populate).toHaveBeenCalledWith(
    //     'items.productId',
    //   );
    // });

    // it('should throw an error if the argument is empty', async () => {
    //   await expect(service.getCart('')).rejects.toThrow('invalid ID');
    //   await expect(service.getCart(null)).rejects.toThrow('invalid ID');
    //   await expect(service.getCart(undefined)).rejects.toThrow('invalid ID');
    // });
  });

  describe('addToCart', () => {
    it('should add products to cart` );', async () => {
      // premisa
      //Types.ObjectId.isValid = jest.fn().mockReturnValue(true);

      const items = [{ productId: '5f8d0d55b54764421b7156f0', quantity: 2 }];
      const result = await service.addToCart('1', items);

      expect(result).toEqual(mockCart);
      expect(mockCartModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(mockCartModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: '1', 'items.productId': '5f8d0d55b54764421b7156f0' },
        {
          $inc: { 'items.$.quantity': 2 },
        },
        { new: true },
      );
    });
    // it('should throw new BadRequestException `Invalid mongodb ID: ${productId}`   );', async () => {
    //   const items = [{ productId: '5f8', quantity: 2 }];

    //   // Mockando o retorno de Types.ObjectId.isValid para false
    //   jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(false);

    //   // Testando se o método addToCart lança a exceção esperada
    //   await expect(service.addToCart('1', items)).rejects.toThrow(
    //     'Invalid ID: 5f8',
    //   );

    //   // Verificando que o método findOneAndUpdate não foi chamado
    //   expect(mockCartModel.findOneAndUpdate).not.toHaveBeenCalled();
    // });

    it('should throw BadRequestException for empty productId', async () => {
      const items = [{ productId: '', quantity: 2 }];
      await expect(service.addToCart('1', items)).rejects.toThrow(
        'Insert valid ID',
      );
    });

    it('should throw Error if stock is insufficient', async () => {
      jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(true);
      mockProductService.findOne.mockResolvedValueOnce({
        ...mockProduct,
        stock: 1,
      });

      const items = [{ productId: '5f8d0d55b54764421b7156f0', quantity: 10 }];
      await expect(service.addToCart('1', items)).rejects.toThrow(
        'Insufficient stock for product: Test Product',
      );
    });
  });

  describe('removeFromCart', () => {
    it('should remove product from cart successfully', async () => {
      // Mock da resposta do findOneAndUpdate
      mockCartModel.findOneAndUpdate.mockResolvedValueOnce({
        userId: '1',
        items: [], // items como array vazio para simular o carrinho após remoção do produto
      });

      const result = await service.removeFromCart(
        '1',
        '5f8d0d55b54764421b7156f0',
      );

      // O esperado é que o carrinho tenha a estrutura correta, com items como array vazio
      expect(result).toEqual({
        userId: '1',
        items: [], // Carrinho atualizado sem itens
      });

      expect(mockCartModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: '1' },
        { $pull: { items: { productId: '5f8d0d55b54764421b7156f0' } } },
        { new: true },
      );
    });

    it('should return an error message if product is not removed', async () => {
      // Mock para o caso de o produto não ser removido do carrinho
      mockCartModel.findOneAndUpdate.mockResolvedValueOnce({
        userId: '1',
        items: [
          { productId: '5f8d0d55b54764421b7156f0', quantity: 2 }, // Produto ainda no carrinho
        ],
      });

      // Espera-se que a função lance uma exceção com a mensagem de erro
      await expect(
        service.removeFromCart('1', '5f8d0d55b54764421b7156f0'),
      ).rejects.toThrowError(
        'Produto 5f8d0d55b54764421b7156f0 não foi removido do carrinho do usuário 1.',
      );

      // Verifica se o método foi chamado corretamente
      expect(mockCartModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: '1' },
        { $pull: { items: { productId: '5f8d0d55b54764421b7156f0' } } },
        { new: true },
      );
    });
  });

  describe('decreaseProductQuantity', () => {
    it('should decrease the product quantity in cart', async () => {
      const mockCartWithSave = {
        ...mockCart,
        items: [
          {
            productId: '5f8d0d55b54764421b7156f0',
            quantity: 1, // A quantidade foi decrementada
          },
          ...mockCart.items.slice(1),
        ],
        save: jest.fn().mockResolvedValue(mockCart), // Mock do método save
      };

      mockCartModel.findOneAndUpdate.mockResolvedValueOnce(mockCartWithSave); // Retorna mockCartWithSave para este teste

      const result = await service.decreaseProductQuantity(
        '1',
        '5f8d0d55b54764421b7156f0',
        1,
      );

      // Compara apenas as propriedades do carrinho, ignorando o método 'save'
      expect(result).toMatchObject({
        ...mockCart,
        items: [
          { productId: '5f8d0d55b54764421b7156f0', quantity: 1 }, // A quantidade deve ter sido decrementada para 1
        ],
      });

      expect(mockCartModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: '1', 'items.productId': '5f8d0d55b54764421b7156f0' },
        {
          $inc: {
            'items.$.quantity': -1,
          },
        },
        { new: true },
      );

      expect(mockCartWithSave.save).toHaveBeenCalled();
    });

    it('should throw Error if quantity to decrement is zero or negative', async () => {
      await expect(
        service.decreaseProductQuantity('1', '5f8d0d55b54764421b7156f0', 0),
      ).rejects.toThrow(
        'The quantity to be decrease need to positive and greater than zero.',
      );
    });

    it('should throw an error when the cart is not found for the user', async () => {
      // Simula o retorno de um carrinho inexistente
      mockCartModel.findOneAndUpdate.mockResolvedValueOnce(null);

      // Espera-se que o método lance um erro com a mensagem correta
      await expect(
        service.decreaseProductQuantity('1', '5f8d0d55b54764421b7156f0', 1),
      ).rejects.toThrowError('Cart was not found for user 1.');
    });

    it('should throw an error when the product is not found in the cart', async () => {
      // Simula o retorno de um carrinho sem o produto procurado
      const mockCartWithNoProduct = {
        ...mockCart,
        items: [{ productId: '5f8d0d55b54764421b7156f0', quantity: 2 }],
      };

      mockCartModel.findOneAndUpdate.mockResolvedValueOnce(
        mockCartWithNoProduct,
      );

      // Espera-se que o método lance um erro com a mensagem correta
      await expect(
        service.decreaseProductQuantity('1', 'non-existing-product-id', 1),
      ).rejects.toThrowError(
        'Product non-existing-product-id was not found for user 1.',
      );
    });
  });
});
