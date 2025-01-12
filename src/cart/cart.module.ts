import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ProductsModule } from './../product/product.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CartSchema, Cart } from './schemas/cart.schema';
import { DatabaseModule } from './../database/databa.module';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    ProductsModule,
  ],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}
