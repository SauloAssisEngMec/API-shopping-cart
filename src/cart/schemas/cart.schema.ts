import * as mongoose from 'mongoose';

// export const CartSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: String,
//       required: true, // se for necessário que o userId seja obrigatório
//     },
//     items: [
//       {
//         productId: {
//           type: String,
//           required: true, // se for necessário que productId seja obrigatório
//         },
//         quantity: {
//           type: Number,
//           required: true, // se for necessário que quantity seja obrigatória
//         },
//       },
//     ],
//   },
//   { timestamps: true }, // Para registrar quando o documento foi criado ou atualizado
// );

// export interface Cart extends mongoose.Document {
//   userId: string;
//   items: { productId: string; quantity: number }[];
// }

export const CartSchema = new mongoose.Schema({
  userId: String,

  items: Array<{ productId: string; quantity: number; createAt: Date }>(),

  createdAt: { type: Date, default: Date.now },
});
