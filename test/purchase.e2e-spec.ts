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
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({});

jest.setTimeout(30000);

describe('Integration test to Purchase flow', () => {
  let module: TestingModule;
  let productService: ProductService;
  let cartService: CartService;
  let purchaseService: PurchaseService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(process.env.DATABASE_URL),
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
      await module.close();

      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
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

      const product = await productService.create(productData);

      expect(product).toBeDefined();
      expect(product.name).toBe(productData.name);
      expect(product.price).toBe(productData.price);
      expect(product.stock).toBe(productData.stock);
      expect(product.description).toBe(productData.description);
      expect(product.productCategory).toBe(productData.productCategory);

      expect(product._id).toBeDefined();
    });

    it('should add items to the cart', async () => {
      const product = await productService.create({
        name: 'Test Product',
        price: 10,
        stock: 5,
        description: 'Test product description',
        productCategory: 'test',
      });

      const userId = new mongoose.Types.ObjectId();

      const cart = await cartService.addToCart(userId.toString(), [
        { productId: product._id.toString(), quantity: 2 },
      ]);

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

      expect(purchase.items.length).toBe(1);
      expect(purchase.total).toBe(60);

      const updatedProduct = await productService.findOne(
        product._id.toString(),
      );
      expect(updatedProduct.stock).toBe(7);

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
