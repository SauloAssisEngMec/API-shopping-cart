import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { DatabaseModule } from './../database/databa.module';
import { cartProviders } from './cart.providers';

import { ProductModule } from './../product/product.module';

@Module({
  imports: [DatabaseModule, ProductModule],
  providers: [CartService, ...cartProviders],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}
