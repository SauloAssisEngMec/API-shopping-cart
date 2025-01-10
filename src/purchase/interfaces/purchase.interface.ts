import { Document } from 'mongoose';

export interface Purchase extends Document {
  userId: string;

  items: Array<{ productId: string; quantity: number; price: number }>;

  total: number;

  readonly createdAt: Date;
}
