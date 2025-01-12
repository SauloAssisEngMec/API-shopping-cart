import { Document } from 'mongoose';
import { PurchaseItemType } from './purchase-item.type';

export interface Purchase extends Document {
  userId: string;

  items: PurchaseItemType[];

  total: number;

  readonly createdAt: Date;
}
