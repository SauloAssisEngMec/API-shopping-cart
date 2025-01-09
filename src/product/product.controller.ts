import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductDto } from './dto/product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async createProduct(@Body() newProduct: ProductDto) {
    console.log('Novo produto adicionado', newProduct);
    return this.productService.create(newProduct);
  }

  @Get()
  async getAllProducts() {
    const productList = await this.productService.findAll();
    console.log('Lista de produtos', productList);
    return productList;
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.productService.delete(id);
  }
}
