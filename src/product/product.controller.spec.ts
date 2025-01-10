import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
//import { ProductModule } from './product.module';

describe('ProductController', () => {
  let productController: ProductController;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      //imports: [ProductModule],
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    productController = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(productController).toBeDefined();
    expect(productService).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const newProduct: ProductDto = { name: 'Test Product', price: 100 };
      const createdProduct = { id: '1', ...newProduct };

      mockProductService.create.mockResolvedValue(createdProduct);

      const result = await productController.createProduct(newProduct);

      expect(result).toEqual(createdProduct);
      expect(mockProductService.create).toHaveBeenCalledWith(newProduct);
    });
  });

  describe('getAllProducts', () => {
    it('should return a list of products', async () => {
      const productList = [
        { id: '1', name: 'Product 1', price: 100 },
        { id: '2', name: 'Product 2', price: 200 },
      ];

      mockProductService.findAll.mockResolvedValue(productList);

      const result = await productController.getAllProducts();

      expect(result).toEqual(productList);
      expect(mockProductService.findAll).toHaveBeenCalled();
    });
  });

  describe('getProduct', () => {
    it('should return a product by id', async () => {
      const product = { id: '1', name: 'Product 1', price: 100 };

      mockProductService.findOne.mockResolvedValue(product);

      const result = await productController.getProduct('1');

      expect(result).toEqual(product);
      expect(mockProductService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product by id', async () => {
      const deleteResult = { deleted: true };

      mockProductService.delete.mockResolvedValue(deleteResult);

      const result = await productController.deleteProduct('1');

      expect(result).toEqual(deleteResult);
      expect(mockProductService.delete).toHaveBeenCalledWith('1');
    });
  });
});
