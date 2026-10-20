import mongoose, { Schema, Document } from 'mongoose';

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  PASSIVE = 'PASSIVE',
  DELETED = 'DELETED',
}

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number; // Integer kuruş (Örn: 100 TL = 10000 kuruş)
  unitId: mongoose.Types.ObjectId;
  barcode?: string;
  stockQuantity: number;
  vatRate: number; // Örn: 1, 10, 20
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    unitId: {
      type: Schema.Types.ObjectId,
      ref: 'Unit',
      required: true,
    },
    barcode: {
      type: String,
      trim: true,
    },
    stockQuantity: {
      type: Number,
      default: 0,
    },
    vatRate: {
      type: Number,
      default: 20,
    },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
