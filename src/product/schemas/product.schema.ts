import * as mongoose from 'mongoose';

export const ProductSchema = new mongoose.Schema({
  name: String,

  description: String,

  price: Number,

  stock: Number,

  productCategory: String,
});
