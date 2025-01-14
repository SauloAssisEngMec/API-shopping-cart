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
  });

  describe('addToCart', () => {
    it('should add products to cart` );', async () => {
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
      mockCartModel.findOneAndUpdate.mockResolvedValueOnce({
        userId: '1',
        items: [],
      });

      const result = await service.removeFromCart(
        '1',
        '5f8d0d55b54764421b7156f0',
      );

      expect(result).toEqual({
        userId: '1',
        items: [],
      });

      expect(mockCartModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: '1' },
        { $pull: { items: { productId: '5f8d0d55b54764421b7156f0' } } },
        { new: true },
      );
    });

    it('should return an error message if product is not removed', async () => {
      mockCartModel.findOneAndUpdate.mockResolvedValueOnce({
        userId: '1',
        items: [{ productId: '5f8d0d55b54764421b7156f0', quantity: 2 }],
      });

      await expect(
        service.removeFromCart('1', '5f8d0d55b54764421b7156f0'),
      ).rejects.toThrowError(
        'Product 5f8d0d55b54764421b7156f0 was not remove fom user cart 1.',
      );

      expect(mockCartModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: '1' },
        { $pull: { items: { productId: '5f8d0d55b54764421b7156f0' } } },
        { new: true },
      );
    });
  });

  describe('decreaseProductQuantity', () => {
    it('should decrease the product quantity in cart', async () => {
      mockCartModel.findOne.mockResolvedValueOnce(mockCart);

      const mockCartWithSave = {
        ...mockCart,
        items: [
          {
            productId: '5f8d0d55b54764421b7156f0',
            quantity: 1,
          },
          ...mockCart.items.slice(1),
        ],
        save: jest.fn().mockResolvedValue(mockCart),
      };

      mockCartModel.findOneAndUpdate.mockResolvedValueOnce(mockCartWithSave);

      const result = await service.decreaseProductQuantity(
        '1',
        '5f8d0d55b54764421b7156f0',
        1,
      );

      expect(result).toMatchObject({
        ...mockCart,
        items: [{ productId: '5f8d0d55b54764421b7156f0', quantity: 1 }],
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

    it('should throw an error when the cart is not found for the user', async () => {
      mockCartModel.findOneAndUpdate.mockResolvedValueOnce(null);

      await expect(
        service.decreaseProductQuantity('1', '5f8d0d55b54764421b7156f0', 1),
      ).rejects.toThrowError('There is no Cart yet to User ID: ${userId}');
    });
  });
});
