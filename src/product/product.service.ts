//import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ProductDto } from './dto/product.dto';
import { Product as ProductInterface } from './types/product.interface';
import { InjectModel } from '@nestjs/mongoose';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Product } from './schemas/product.schema';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductInterface>,
  ) {}

  async create(productDto: ProductDto): Promise<ProductInterface> {
    //return this.productModel.create(productDto);
    const dtoInstance = plainToInstance(ProductDto, productDto);
    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
      throw new BadRequestException('The payload is incorrect');
    }

    return this.productModel.create(productDto);
  }

  async findAll(): Promise<ProductInterface[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: string): Promise<ProductInterface> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async delete(id: string): Promise<ProductInterface> {
    const product = await this.productModel.findByIdAndDelete(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }
}
