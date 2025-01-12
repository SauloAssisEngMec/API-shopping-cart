import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

describe('CartController', () => {
  let controller: CartController;
  let cartService: CartService;

  // Mock para o CartService
  const mockCartService = {
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    decreaseProductQuantity: jest.fn(),
    getCart: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: mockCartService, // Mocka o CartService
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    cartService = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(cartService).toBeDefined();
  });

  describe('addToCart', () => {
    it('should call addToCart and return result', async () => {
      const userId = '1';
      const items = [{ productId: '123', quantity: 2 }];
      const result = { _id: '2', userId, items };

      mockCartService.addToCart.mockResolvedValue(result);

      const response = await controller.addToCart(userId, items);
      expect(response).toEqual(result);
      expect(mockCartService.addToCart).toHaveBeenCalledWith(userId, items);
      expect(mockCartService.addToCart).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeFromCart', () => {
    it('should call removeFromCart and return result', async () => {
      const userId = '1';
      const productId = '123';
      const result = { success: true };

      mockCartService.removeFromCart.mockResolvedValue(result);

      const response = await controller.removeFromCart(userId, productId);
      expect(response).toEqual(result);
      expect(mockCartService.removeFromCart).toHaveBeenCalledWith(
        userId,
        productId,
      );
    });
  });

  describe('decreaseProductQuantity', () => {
    it('should call decreaseProductQuantity and return result', async () => {
      const userId = 'user123';
      const productId = 'prod123';
      const quantity = 1;
      const result = { success: true };

      mockCartService.decreaseProductQuantity.mockResolvedValue(result);

      const response = await controller.decreaseProductQuantity(
        userId,
        productId,
        quantity,
      );
      expect(response).toEqual(result);
      expect(mockCartService.decreaseProductQuantity).toHaveBeenCalledWith(
        userId,
        productId,
        quantity,
      );
    });

    it('should throw an error if quantity is invalid', async () => {
      const userId = '123';
      const productId = '123';
      const quantity = -1;

      await expect(
        controller.decreaseProductQuantity(userId, productId, quantity),
      ).rejects.toThrowError('Is not a válid quantity');
    });
  });

  describe('getCart', () => {
    it('should call getCart and return cart data', async () => {
      const userId = '1';
      const cart = { items: [{ productId: '123', quantity: 2 }] };

      mockCartService.getCart.mockResolvedValue(cart);

      const response = await controller.getCart(userId);
      expect(response).toEqual(cart);
      expect(mockCartService.getCart).toHaveBeenCalledWith(userId);
    });
  });
});
