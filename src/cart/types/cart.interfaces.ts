import { Document } from 'mongoose';
import { CartItemType } from './cart-item.type';

export interface Cart extends Document {
  userId: string;
  items: CartItemType[];
}
