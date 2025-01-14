import { Controller, Get, Param, Post } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post(':userId/checkout')
  @ApiOperation({
    summary: 'make purchases for a given user',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user who will make the purchase',
    type: String,
  })
  async checkout(@Param('userId') userId: string) {
    return this.purchaseService.checkout(userId);
  }

  @ApiOperation({
    summary: 'Obtain purchase  statistics for a given user',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user who will obtain purchase statistics',
    type: String,
  })
  @Get(':userId/statistics')
  async getPurchaseStatistics(@Param('userId') userId: string) {
    return this.purchaseService.getPurchaseStatistics(userId);
  }
}
