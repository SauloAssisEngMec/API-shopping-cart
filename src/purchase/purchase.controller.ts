import { Controller, Get, Param, Post } from '@nestjs/common';
import { PurchaseService } from './purchase.service';

@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post(':userId/checkout')
  async checkout(@Param('userId') userId: string) {
    return this.purchaseService.checkout(userId);
  }

  @Get(':userId/statistics')
  async getPurchaseStatistics(@Param('userId') userId: string) {
    return this.purchaseService.getPurchaseStatistics(userId);
  }
}
