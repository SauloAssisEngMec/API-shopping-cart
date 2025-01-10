import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
// import { CartService } from './cart.service';
// import { ProductService } from './../product/product.service';
// import { CartModule } from './cart.module';
// import { ProductModule } from './../product/product.module';

describe('CartController', () => {
  let controller: CartController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      //imports: [CartModule, ProductModule],
      controllers: [CartController],
      //providers: [CartService, ProductService],
    }).compile();

    controller = module.get<CartController>(CartController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
