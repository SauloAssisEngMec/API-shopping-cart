import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseService } from './purchase.service';
import { getModelToken } from '@nestjs/mongoose';
import { Purchase } from './schemas/purchase.schema';
import { CartService } from './../cart/cart.service';
import { ProductService } from './../product/product.service';

const mockPurchase = {
  _id: '123',
  userId: '1234',
  items: [{ productId: '12345', quantity: 2, price: 100 }],
  total: 200,
};

const mockCart = {
  userId: '1234',
  items: [{ productId: '12345', quantity: 2 }],
};

const mockProduct = {
  _id: '12345',
  name: 'Test Product',
  stock: 10,
  price: 100,
  save: jest.fn(),
};

const mockPurchaseModel = {
  create: jest.fn(),
  find: jest.fn().mockResolvedValue([mockPurchase]),
  aggregate: jest.fn(),
};

const mockCartService = {
  getCart: jest.fn().mockResolvedValue(mockCart),
  removeFromCart: jest.fn().mockResolvedValue(true),
};

const mockProductService = {
  findOne: jest.fn().mockResolvedValue(mockProduct),
};

describe('PurchaseService', () => {
  let service: PurchaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseService,
        {
          provide: getModelToken(Purchase.name),
          useValue: mockPurchaseModel,
        },
        { provide: CartService, useValue: mockCartService },
        { provide: ProductService, useValue: mockProductService },
      ],
    }).compile();

    service = module.get<PurchaseService>(PurchaseService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkout', () => {
    it('should successfully process checkout', async () => {
      mockPurchaseModel.create.mockResolvedValue(mockPurchase);

      const result = await service.checkout('1234');

      expect(mockCartService.getCart).toHaveBeenCalledWith('1234');
      expect(mockProductService.findOne).toHaveBeenCalledWith('12345');
      expect(mockPurchaseModel.create).toHaveBeenCalledWith({
        userId: '1234',
        items: [{ productId: '12345', quantity: 2, price: 100 }],
        total: 200,
      });
      expect(mockCartService.removeFromCart).toHaveBeenCalledWith(
        '1234',
        '12345',
      );

      expect(result).toEqual({
        userId: '1234',
        items: [{ productId: '12345', quantity: 2, price: 100 }],
        total: 200,
        _id: '123',
      });
    });

    it('should throw an error if the cart is empty', async () => {
      mockCartService.getCart.mockResolvedValueOnce({ items: [] });
      await expect(service.checkout('1234')).rejects.toThrow('Cart is empty');
    });

    it('should throw an error if product is not found', async () => {
      mockProductService.findOne.mockResolvedValueOnce(null);
      await expect(service.checkout('1234')).rejects.toThrow(
        'Product with ID 12345 not found',
      );
    });

    it('should throw an error if stock is insufficient', async () => {
      mockProduct.stock = 1;
      await expect(service.checkout('1234')).rejects.toThrow(
        'Insufficient stock for product: Test Product',
      );
    });
  });

  describe('getPurchaseStatistics', () => {
    it('should return purchase statistics', async () => {
      mockPurchaseModel.aggregate.mockImplementation((pipeline) => {
        if (pipeline[0]?.$match?.userId) {
          if (
            pipeline.some((stage) => stage?.$group?.totalSales !== undefined)
          ) {
            return [{ totalSales: 200 }];
          }
          if (
            pipeline.some((stage) => stage?.$group?.totalQuantity !== undefined)
          ) {
            return [{ totalQuantity: 2 }];
          }
          if (pipeline.some((stage) => stage?.$sort?.totalSold !== undefined)) {
            return [{ _id: '12345', totalSold: 2 }];
          }
        }
        return [];
      });

      const result = await service.getPurchaseStatistics('1234');

      expect(mockPurchaseModel.aggregate).toHaveBeenCalledTimes(3);
      expect(mockProductService.findOne).toHaveBeenCalledWith('12345');
      expect(result).toEqual({
        totalSales: 200,
        totalProductsSold: 2,
        topSellingProducts: [
          {
            productId: '12345',
            productName: 'Test Product',
            totalSold: 2,
          },
        ],
        allSoldProducts: [
          {
            productId: '12345',
            productName: 'Test Product',
            quantity: 2,
            price: 100,
          },
        ],
      });
    });
  });
});
