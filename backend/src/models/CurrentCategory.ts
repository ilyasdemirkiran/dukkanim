import mongoose, { Schema, Document } from 'mongoose';

export interface ICurrentCategory extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CurrentCategorySchema = new Schema<ICurrentCategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CurrentCategory = mongoose.model<ICurrentCategory>('CurrentCategory', CurrentCategorySchema);
