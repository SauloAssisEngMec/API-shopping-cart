import { Module } from '@nestjs/common';

import { ProductsModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { PurchaseModule } from './purchase/purchase.module';
import { DatabaseModule } from './database/databa.module';

@Module({
  imports: [DatabaseModule, ProductsModule, CartModule, PurchaseModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
