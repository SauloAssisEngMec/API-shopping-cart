export class PurchasetDto {
  userId: string;

  items: Array<{ productId: string; quantity: number; price: number }>;

  total: number;

  createdAt: Date;
}
