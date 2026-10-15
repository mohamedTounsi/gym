import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDynamicField extends Document {
  _id: mongoose.Types.ObjectId;
  label: string;
  key: string;
  type: "text" | "number" | "select";
  options?: string[];
  placeholder?: string;
  description?: string;
  required: boolean;
  order: number;
  createdAt: Date;
}

const DynamicFieldSchema = new Schema<IDynamicField>(
  {
    label: { type: String, required: true, trim: true },
    key: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ["text", "number", "select"], default: "text" },
    options: [{ type: String }],
    placeholder: { type: String, default: "" },
    description: { type: String, default: "" },
    required: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const DynamicField: Model<IDynamicField> =
  mongoose.models.DynamicField ||
  mongoose.model<IDynamicField>("DynamicField", DynamicFieldSchema);

export default DynamicField;
