import { PurchaseItemType } from './purchase-item.type';

export type PurchaseType = {
  userId: string;

  items: PurchaseItemType[];

  total: number;

  createdAt?: Date;
};
