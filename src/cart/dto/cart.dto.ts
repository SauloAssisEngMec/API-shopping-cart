export class CartDto {
  readonly userId: string;
  readonly items: Array<{ productId: string; quantity: number }>;
}
