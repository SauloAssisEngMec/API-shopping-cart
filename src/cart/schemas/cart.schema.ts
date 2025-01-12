import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Product } from './../../product/schemas/product.schema';
import { CartItemType } from './../types/cart-item.type';

export type CartDocument = HydratedDocument<Cart>;

@Schema({ collection: 'cart', timestamps: true })
export class Cart {
  @Prop({ required: true })
  userId: string;

  @Prop({
    type: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: Product.name },
        quantity: { type: Number, required: true, min: 1 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  items: CartItemType[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
