import * as mongoose from 'mongoose';

export const PurchaseSchema = new mongoose.Schema({
  userId: String,

  items: Array<{ productId: string; quantity: number; price: number }>(),

  total: Number,

  createdAt: { type: Date, default: Date.now },
});
