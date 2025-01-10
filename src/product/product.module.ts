import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { DatabaseModule } from './../database/databa.module';
import { productProviders } from './product.providers';
import { ProductController } from './product.controller';

@Module({
  imports: [DatabaseModule],

  providers: [ProductService, ...productProviders],

  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
