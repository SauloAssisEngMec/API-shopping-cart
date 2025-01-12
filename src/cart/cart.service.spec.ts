import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getModelToken } from '@nestjs/mongoose';
import { Cart } from './schemas/cart.schema';
import { ProductService } from './../product/product.service';
import { CartType } from './types/cart.type';

const mockCart: CartType = {
  userId: '1',
  items: [
    {
      productId: '1234',
      quantity: 2,
    },
  ],
};

const mockProduct = {
  _id: '1234',
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
  findOne: jest.fn().mockResolvedValue(mockCart),
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
  });

  describe('addToCart', () => {
    it('should add product to cart', async () => {
      const items = [{ productId: '1234', quantity: 2 }];
      const result = await service.addToCart('1', items);

      expect(result).toEqual(mockCart);
      expect(mockCartModel.findOneAndUpdate).toHaveBeenCalledTimes(2);
      expect(mockCartModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: '1', 'items.productId': '1234' },
        {
          $inc: { 'items.$.quantity': 2 },
        },
        { new: true },
      );
    });

    it('should throw BadRequestException for invalid productId', async () => {
      const items = [{ productId: '', quantity: 2 }];
      await expect(service.addToCart('1', items)).rejects.toThrow(
        'Inserir ID válido',
      );
    });

    it('should throw Error if stock is insufficient', async () => {
      mockProductService.findOne.mockResolvedValueOnce({
        ...mockProduct,
        stock: 1,
      });

      const items = [{ productId: '1234', quantity: 10 }];
      await expect(service.addToCart('1', items)).rejects.toThrow(
        'Estoque insuficiente para o produto: Test Product',
      );
    });
  });

  describe('removeFromCart', () => {
    it('should remove product from cart', async () => {
      const result = await service.removeFromCart('1', '1234');
      expect(result).toEqual(mockCart);
      expect(mockCartModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: '1' },
        { $pull: { items: { productId: '1234' } } },
        { new: true },
      );
    });

    it('should return a message if the cart is not found', async () => {
      mockCartModel.findOneAndUpdate.mockResolvedValueOnce(null);

      const result = await service.removeFromCart('2', '1234');
      expect(result).toBe(
        'Carrinho não encontrado para o usuário especificado 2.',
      );
    });
  });

  describe('decreaseProductQuantity', () => {
    it('should decrease the product quantity in cart', async () => {
      const result = await service.decreaseProductQuantity('1', '1234', 1);
      expect(result).toEqual(mockCart);
      expect(mockCartModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: '1', 'items.productId': '1234' },
        {
          $inc: {
            'items.$.quantity': -1,
          },
        },
        { new: true },
      );
    });

    it('should throw Error if quantity to decrement is zero or negative', async () => {
      await expect(
        service.decreaseProductQuantity('1', '1234', 0),
      ).rejects.toThrow(
        'A quantidade a ser decrementada deve ser um número positivo.',
      );
    });

    it('should return a message if product is not found in cart', async () => {
      mockCartModel.findOneAndUpdate.mockResolvedValueOnce(null);

      const result = await service.decreaseProductQuantity('1', 'product2', 1);
      expect(result).toBe(
        'Produto product2 não encontrado no carrinho do usuário 1.',
      );
    });
  });
});
