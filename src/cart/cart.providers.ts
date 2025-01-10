import { Mongoose } from 'mongoose';
import { CartSchema } from './schemas/cart.schema';

export const cartProviders = [
  {
    provide: 'CART_MODEL',
    useFactory: (mongoose: Mongoose) => mongoose.model('Cart', CartSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
