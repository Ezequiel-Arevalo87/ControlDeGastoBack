import { Schema, model, Types } from 'mongoose';

export interface Category {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  color?: string | null;
  icon?: string | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const categorySchema = new Schema<Category>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: null },
    icon: { type: String, default: null },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Unicidad por usuario + nombre (lógico: sin borrados)
categorySchema.index({ userId: 1, name: 1, isDeleted: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });

export const CategoryModel = model<Category>('Category', categorySchema);
