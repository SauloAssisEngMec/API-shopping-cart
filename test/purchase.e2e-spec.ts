import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductService } from './../src/product/product.service';
import { CartService } from './../src/cart/cart.service';
import { PurchaseService } from './../src/purchase/purchase.service';
import {
  ProductSchema,
  Product,
} from './../src/product/schemas/product.schema';
import { CartSchema, Cart } from './../src/cart/schemas/cart.schema';
import {
  PurchaseSchema,
  Purchase,
} from './../src/purchase/schemas/purchase.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Types } from 'mongoose';

describe('Integration test to Purchase flow', () => {
  let module: TestingModule;
  let productService: ProductService;
  let cartService: CartService;
  let purchaseService: PurchaseService;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    //jest.setTimeout(20000);
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Product.name, schema: ProductSchema },
          { name: Cart.name, schema: CartSchema },
          { name: Purchase.name, schema: PurchaseSchema },
        ]),
      ],
      providers: [ProductService, CartService, PurchaseService],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    cartService = module.get<CartService>(CartService);
    purchaseService = module.get<PurchaseService>(PurchaseService);
  });

  afterAll(async () => {
    try {
      await module.close(); // Fecha o módulo de teste Nest.js
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
      }
      if (mongod) {
        await mongod.stop();
      }
    } catch (error) {
      console.error('Error in afterAll:', error);
    }
  });

  describe('Purchase Flow Integration Tests', () => {
    it('should create the cart', async () => {
      const productData = {
        name: 'Test Product',
        price: 10,
        stock: 5,
        description: 'Description of the test product',
        productCategory: 'testCategory',
      };

      // Cria o produto
      const product = await productService.create(productData);

      // Verifica se o produto foi criado corretamente
      expect(product).toBeDefined(); // Verifica se o produto foi retornado
      expect(product.name).toBe(productData.name);
      expect(product.price).toBe(productData.price);
      expect(product.stock).toBe(productData.stock);
      expect(product.description).toBe(productData.description);
      expect(product.productCategory).toBe(productData.productCategory);

      // Verifica o ID do produto
      expect(product._id).toBeDefined(); // O ID gerado deve ser um ObjectId válido
      //expect(Types.ObjectId.isValid(product._id)).toBe(true); // Verifica se o ID
    });

    it('should add items to the cart', async () => {
      const product = await productService.create({
        name: 'Test Product',
        price: 10,
        stock: 5,
        description: 'Test product description',
        productCategory: 'test',
      });

      // Gerando um ID de usuário válido usando Types.ObjectId()
      const userId = new Types.ObjectId();

      // Adicionando o produto ao carrinho
      const cart = await cartService.addToCart(userId.toString(), [
        { productId: product._id.toString(), quantity: 2 },
      ]);

      // Verificando se o produto foi adicionado corretamente ao carrinho
      expect(cart.items.length).toBe(1);
      expect(cart.items[0].quantity).toBe(2);
    });

    it('should make a purchase and update stock', async () => {
      const product = await productService.create({
        name: 'Test Product 2',
        price: 20,
        stock: 10,
        description: ' decritpion integration test',
        productCategory: 'test',
      });

      await cartService.addToCart('user123', [
        { productId: product._id.toString(), quantity: 3 },
      ]);

      const purchase = await purchaseService.checkout('user123');

      // Verify purchase record
      expect(purchase.items.length).toBe(1);
      expect(purchase.total).toBe(60);

      // Verify stock update
      const updatedProduct = await productService.findOne(
        product._id.toString(),
      );
      expect(updatedProduct.stock).toBe(7);

      // Verify cart is cleared
      const cart = await cartService.getCart('user123');
      expect(cart.items.length).toBe(0);
    });

    it('should throw an error when stock is insufficient', async () => {
      const product = await productService.create({
        name: 'Test Product 3',
        price: 15,
        stock: 2,
        description: ' decritpion integration test',
        productCategory: 'test',
      });

      await expect(
        cartService.addToCart('user123', [
          { productId: product._id.toString(), quantity: 3 },
        ]),
      ).rejects.toThrow('Insufficient stock for product: Test Product 3');
    });

    it('should throw an error if productId is empty', async () => {
      const items = [{ productId: '', quantity: 2 }];
      await expect(cartService.addToCart('user123', items)).rejects.toThrow(
        'Cast to ObjectId failed for value \"\" (type string) at path \"_id\" for model \"Product\"',
      );
    });

    it('should throw an error if cart is empty during purchase', async () => {
      await expect(purchaseService.checkout('user123')).rejects.toThrow(
        'Cart is empty',
      );
    });
  });
});
