import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductDto } from './dto/product.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create product' })
  @ApiBody({
    description: 'Product to be added in cart',
    type: ProductDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Product was created successfully.',
    type: ProductDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid  Body inputs.' })
  async createProduct(@Body() newProduct: ProductDto) {
    return this.productService.create(newProduct);
  }

  @Get()
  @ApiOperation({ summary: 'List All products' })
  @ApiResponse({
    status: 200,
    description: 'Products listed successesfully',
    type: [ProductDto],
  })
  @ApiResponse({ status: 400, description: 'Invalid request ' })
  async getAllProducts() {
    const productList = await this.productService.findAll();

    return productList;
  }
  @Get(':id')
  @ApiOperation({ summary: 'List one product by id.' })
  @ApiResponse({
    status: 200,
    description: 'Products listed successfully',
    type: ProductDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid ID' })
  async getProduct(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete one product by id.' })
  @ApiResponse({
    status: 200,
    description: 'Products removed successfully',
    type: ProductDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid ID' })
  async deleteProduct(@Param('id') id: string) {
    return this.productService.delete(id);
  }
}
