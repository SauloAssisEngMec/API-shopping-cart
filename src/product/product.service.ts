import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ProductDto } from './dto/product.dto';
import { Product as ProductInterface } from './interfaces/product.interface';

@Injectable()
export class ProductService {
  constructor(
    @Inject('PRODUCT_MODEL')
    private productModel: Model<ProductInterface>,
  ) {}

  async create(productDto: ProductDto): Promise<ProductInterface> {
    const newProduct = new this.productModel(productDto);
    return newProduct.save();
  }

  async findAll(): Promise<ProductInterface[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: string): Promise<ProductInterface> {
    return this.productModel.findById(id).exec();
  }

  async delete(id: string): Promise<ProductInterface> {
    return this.productModel.findByIdAndDelete(id).exec();
  }
}
