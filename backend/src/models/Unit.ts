import mongoose, { Schema, Document } from 'mongoose';

export interface IUnit extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const UnitSchema = new Schema<IUnit>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Unit = mongoose.model<IUnit>('Unit', UnitSchema);
