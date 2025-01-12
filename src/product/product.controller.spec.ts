import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductDto } from './dto/product.dto';

describe('ProductController', () => {
  let productController: ProductController;
  let productService: ProductService;

  const mockProductService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    productController = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(productController).toBeDefined();
    expect(productService).toBeDefined();
  });

  const productList = [
    {
      id: '1',
      name: 'desing intensive data application',
      description: 'software book',
      price: 100,
      stock: 10,
      productCategory: 'book',
    },
    {
      id: '2',
      name: 'tablet',
      description: 'test',
      price: 100,
      stock: 10,
      productCategory: 'eletronics',
    },
  ];

  describe('createProduct', () => {
    it('should call create method an return new product', async () => {
      const newProduct: ProductDto = productList[0];

      const createdProduct = { id: '1', ...newProduct };

      mockProductService.create.mockResolvedValue(createdProduct);

      const result = await productController.createProduct(newProduct);

      expect(result).toEqual(createdProduct);
      expect(mockProductService.create).toHaveBeenCalledWith(newProduct);
      expect(mockProductService.create).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception', async () => {
      jest
        .spyOn(mockProductService, 'create')
        .mockRejectedValueOnce(new Error('Exception'));

      await expect(
        productController.createProduct({} as ProductDto),
      ).rejects.toThrowError('Exception');
    });
  });
  describe('getAllProducts', () => {
    it('should call getAllProducts an return a list of products', async () => {
      mockProductService.findAll.mockResolvedValue(productList);

      const result = await productController.getAllProducts();

      expect(result).toEqual(productList);
      expect(mockProductService.findAll).toHaveBeenCalledTimes(1);
      expect(mockProductService.findAll).toHaveBeenCalled();
    });

    it('should call getAllProducts and return an empty list', async () => {
      mockProductService.findAll.mockResolvedValue([]);

      const result = await productController.getAllProducts();

      expect(result).toEqual([]);
      expect(mockProductService.findAll).toHaveBeenCalledTimes(1);
      expect(mockProductService.findAll).toHaveBeenCalled();
    });

    it('should call getAllProducts and throw an exception', async () => {
      jest
        .spyOn(mockProductService, 'findAll')
        .mockRejectedValueOnce(new Error('Exception'));

      await expect(productController.getAllProducts()).rejects.toThrowError(
        'Exception',
      );
    });
  });

  describe('getProduct', () => {
    it('should call getProduct return just one product by id', async () => {
      mockProductService.findOne.mockResolvedValue(productList[0]);

      const result = await productController.getProduct('1');

      expect(result).toEqual(productList[0]);
      expect(mockProductService.findOne).toHaveBeenCalledTimes(1);
      expect(mockProductService.findOne).toHaveBeenCalledWith('1');
    });

    it('should call getProduct and throw an exception', async () => {
      jest
        .spyOn(mockProductService, 'findOne')
        .mockRejectedValueOnce(new Error('Exception'));

      await expect(productController.getProduct('1')).rejects.toThrowError(
        'Exception',
      );
    });
  });

  describe('deleteProduct', () => {
    it('should call deleteProduct and delete a product by Id', async () => {
      const deleteResult = { deleted: true };

      mockProductService.delete.mockResolvedValue(deleteResult);

      const result = await productController.deleteProduct('1');

      expect(result).toEqual(deleteResult);
      expect(mockProductService.delete).toHaveBeenCalledWith('1');
      expect(mockProductService.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception', async () => {
      jest
        .spyOn(mockProductService, 'delete')
        .mockRejectedValueOnce(new Error('Exception'));

      await expect(productController.deleteProduct('1')).rejects.toThrowError(
        'Exception',
      );
    });
  });
});
