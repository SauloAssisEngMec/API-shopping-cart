import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
//import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { PurchaseModule } from './purchase/purchase.module';
import { DatabaseModule } from './database/databa.module';

@Module({
  imports: [
    DatabaseModule,
    // MongooseModule.forRootAsync({
    //   useFactory: async (configService: ConfigService) => ({
    //     uri: configService.get<string>('DATABASE_URL'),
    //   }),
    //   inject: [ConfigService],
    // }),
    ProductsModule,
    CartModule,
    PurchaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
