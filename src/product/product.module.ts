// import { Module } from '@nestjs/common';
//import { ProductService } from './product.service';
// import { DatabaseModule } from './../database/databa.module';
// import { productProviders } from './product.providers';
// import { ProductController } from './product.controller';

// @Module({
//   imports: [DatabaseModule],

//   providers: [ProductService, ...productProviders],

//   controllers: [ProductController],
//   exports: [ProductService],
// })
// export class ProductModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductService } from './product.service';
import { DatabaseModule } from './../database/databa.module';
import { ProductController } from './product.controller';
//import { MongooseModule } from './../database/databa.module';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [MongooseModule, ProductService],
})
export class ProductsModule {}
