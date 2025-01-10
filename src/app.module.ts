import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
//import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { PurchaseModule } from './purchase/purchase.module';
// Import MongooseModule

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    // MongooseModule.forRootAsync({
    //   useFactory: async (configService: ConfigService) => ({
    //     uri: configService.get<string>('DATABASE_URL'),
    //   }),
    //   inject: [ConfigService],
    // }),
    ProductModule,
    CartModule,
    PurchaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
