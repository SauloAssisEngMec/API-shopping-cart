export class CartDto {
  readonly userId: string;
  items: Array<{ productId: string; quantity: number }>;
}
