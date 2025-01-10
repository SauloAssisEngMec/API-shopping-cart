import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { DatabaseModule } from 'src/database/databa.module';
import { cartProviders } from './cart.providers';

@Module({
  imports: [DatabaseModule],
  providers: [CartService, ...cartProviders],
  controllers: [CartController],
})
export class CartModule {}
