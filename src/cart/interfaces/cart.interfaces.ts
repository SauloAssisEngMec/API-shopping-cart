import { Document } from 'mongoose';

export interface Cart extends Document {
  userId: string;
  items: Array<{ productId: string; quantity: number }>;
}
