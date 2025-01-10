import { Document } from 'mongoose';

export interface Cart extends Document {
  readonly userId: string;
  items: Array<{ productId: string; quantity: number }>;
}
