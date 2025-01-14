import mongoose from 'mongoose';
import { CartItemType } from './cart-item.type';

export type CartType = {
  _id?: mongoose.Types.ObjectId;
  userId: string;
  items: CartItemType[];
};
