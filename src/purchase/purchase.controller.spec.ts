import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseController } from './purchase.controller';
import { PurchaseService } from './purchase.service';

describe('PurchaseController', () => {
  let controller: PurchaseController;
  let purchaseService: PurchaseService;

  const mockPurchaseService = {
    checkout: jest.fn(),
    getPurchaseStatistics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseController],
      providers: [
        {
          provide: PurchaseService,
          useValue: mockPurchaseService,
        },
      ],
    }).compile();

    controller = module.get<PurchaseController>(PurchaseController);
    purchaseService = module.get<PurchaseService>(PurchaseService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(purchaseService).toBeDefined();
  });

  describe('checkout', () => {
    it('should call checkout and return the result', async () => {
      const userId = '123';
      const result = { success: true };

      mockPurchaseService.checkout.mockResolvedValue(result);

      const response = await controller.checkout(userId);
      expect(response).toEqual(result);
      expect(mockPurchaseService.checkout).toHaveBeenCalledWith(userId);
      expect(mockPurchaseService.checkout).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if checkout fails', async () => {
      const userId = '123';
      const errorMessage = 'Failed to process checkout';

      mockPurchaseService.checkout.mockRejectedValue(new Error(errorMessage));

      await expect(controller.checkout(userId)).rejects.toThrowError(
        errorMessage,
      );
      expect(mockPurchaseService.checkout).toHaveBeenCalledWith(userId);
      expect(mockPurchaseService.checkout).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPurchaseStatistics', () => {
    it('should call getPurchaseStatistics and return statistics', async () => {
      const userId = '123';
      const statistics = {
        totalPurchases: 10,
        totalSpent: 200,
        lastPurchaseDate: '2024-01-01',
      };

      mockPurchaseService.getPurchaseStatistics.mockResolvedValue(statistics);

      const response = await controller.getPurchaseStatistics(userId);
      expect(response).toEqual(statistics);
      expect(mockPurchaseService.getPurchaseStatistics).toHaveBeenCalledWith(
        userId,
      );
      expect(mockPurchaseService.getPurchaseStatistics).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should return null if user does not exist', async () => {
      const userId = '123';

      mockPurchaseService.getPurchaseStatistics.mockResolvedValue(null);

      const response = await controller.getPurchaseStatistics(userId);
      expect(response).toBeNull();
      expect(mockPurchaseService.getPurchaseStatistics).toHaveBeenCalledWith(
        userId,
      );
      expect(mockPurchaseService.getPurchaseStatistics).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should throw an error if getPurchaseStatistics fails', async () => {
      const userId = '123';
      const errorMessage = 'Failed to fetch statistics';

      mockPurchaseService.getPurchaseStatistics.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(
        controller.getPurchaseStatistics(userId),
      ).rejects.toThrowError(errorMessage);
      expect(mockPurchaseService.getPurchaseStatistics).toHaveBeenCalledWith(
        userId,
      );
      expect(mockPurchaseService.getPurchaseStatistics).toHaveBeenCalledTimes(
        1,
      );
    });
  });
});
