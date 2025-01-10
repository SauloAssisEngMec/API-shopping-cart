import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { DatabaseModule } from './../database/databa.module';
import { purchaseProviders } from './purchase.providers';
import { CartModule } from './../cart/cart.module';

import { ProductModule } from './../product/product.module';

@Module({
  imports: [DatabaseModule, CartModule, ProductModule],
  providers: [PurchaseService, ...purchaseProviders],
  controllers: [PurchaseController],
})
export class PurchaseModule {}
