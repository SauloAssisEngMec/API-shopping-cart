import { Document } from 'mongoose';

export interface Product extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  productCategory: string;
}
