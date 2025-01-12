import { CartItemType } from './cart-item.type';

export type CartType = {
  userId: string;
  items: CartItemType[];
};
