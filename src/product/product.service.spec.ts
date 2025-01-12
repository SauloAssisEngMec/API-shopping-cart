import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import { NotFoundException } from '@nestjs/common';

const mockProduct = {
  _id: '1',
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  stock: 10,
  productCategory: 'Test Category',
};

const mockProductModel = {
  create: jest.fn().mockResolvedValue(mockProduct),
  find: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([mockProduct]),
  }),
  findById: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockProduct),
  }),
  findByIdAndDelete: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockProduct),
  }),
};

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const result = await service.create(mockProduct);

      expect(result).toEqual(mockProduct);
      expect(mockProductModel.create).toHaveBeenCalledWith(mockProduct);
      expect(mockProductModel.create).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception if payload is typed incorrect', async () => {
      const incorrectProductMock: any = {
        _id: '1',
        name: 'Test Product',
        description: 100,
        price: 'string',
        stock: 10,
        productCategory: 'Test Category',
      };

      await expect(service.create(incorrectProductMock)).rejects.toThrow(
        'The payload is incorrect',
      );
    });
    it('should throw an exception if required value is missing', async () => {
      const incorrectProductMock: any = {
        _id: '1',
        description: 100,
        price: 'string',
        stock: 10,
        productCategory: 'Test Category',
      };

      await expect(service.create(incorrectProductMock)).rejects.toThrow(
        'The payload is incorrect',
      );
    });
  });

  describe('findAll', () => {
    it('should return a list of products', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockProduct]);
      expect(mockProductModel.find).toHaveBeenCalled();
      expect(mockProductModel.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const result = await service.findOne('1');
      expect(result).toEqual(mockProduct);
      expect(mockProductModel.findById).toHaveBeenCalledWith('1');
      expect(mockProductModel.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('2')).rejects.toThrow(
        new NotFoundException('Product with ID 2 not found'),
      );
    });
  });

  describe('delete', () => {
    it('should delete a product and return it', async () => {
      const result = await service.delete('1');
      expect(result).toEqual(mockProduct);
      expect(mockProductModel.findByIdAndDelete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if product to delete is not found', async () => {
      mockProductModel.findByIdAndDelete.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.delete('2')).rejects.toThrow(
        new NotFoundException('Product with ID 2 not found'),
      );
    });
  });
});
