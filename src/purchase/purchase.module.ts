import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
//import { DatabaseModule } from './../database/databa.module';
//import { purchaseProviders } from './purchase.providers';
import { CartModule } from './../cart/cart.module';

import { ProductsModule } from './../product/product.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Purchase, PurchaseSchema } from './schemas/purchase.schema';
import { DatabaseModule } from './../database/databa.module';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Purchase.name, schema: PurchaseSchema },
    ]),
    CartModule,
    ProductsModule,
  ],
  providers: [PurchaseService],
  controllers: [PurchaseController],
})
export class PurchaseModule {}
