// import * as mongoose from 'mongoose';

// export const PurchaseSchema = new mongoose.Schema({
//   userId: String,

//   items: Array<{ productId: string; quantity: number; price: number }>(),

//   total: Number,

//   createdAt: { type: Date, default: Date.now },
// });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PurchaseDocument = HydratedDocument<Purchase>;

@Schema({ collection: 'purchase', timestamps: true })
export class Purchase {
  @Prop({ required: true })
  userId: string;

  @Prop({
    type: [{ productId: String, quantity: Number, price: Number }],
    required: true,
  })
  items: { productId: string; quantity: number; price: number }[];

  @Prop({ required: true })
  total: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
