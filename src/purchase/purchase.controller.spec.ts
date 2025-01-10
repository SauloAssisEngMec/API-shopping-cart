import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseController } from './purchase.controller';
//import { PurchaseService } from './purchase.service';
// import { PurchaseModule } from './purchase.module';
// import { ProductModule } from './../product/product.module';
// import { CartModule } from './../cart/cart.module';
// import { ProductService } from './../product/product.service';
// import { CartService } from './../cart/cart.service';

describe('PurchaseController', () => {
  let controller: PurchaseController;
  //let service: PurchaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      //imports: [PurchaseModule, ProductModule, CartModule],
      controllers: [PurchaseController],
      //providers: [PurchaseService, ProductService, CartService],
    }).compile();

    controller = module.get<PurchaseController>(PurchaseController);
    //service = module.get<PurchaseService>(PurchaseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    //expect(service).toBeDefined();
  });
});
