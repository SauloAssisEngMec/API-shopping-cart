import * as mongoose from 'mongoose';

export const PurchasetSchema = new mongoose.Schema({
  userId: String,

  items: Array<{ productId: string; quantity: number; createAt: Date }>(),

  total: Number,

  createdAt: Date,
});
