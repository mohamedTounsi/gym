import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMachineBenchmarks {
  beginner: number;
  intermediate: number;
  advanced: number;
  elite: number;
}

export interface IMachine extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: "Chest" | "Back" | "Legs" | "Shoulders" | "Arms" | "Core";
  picture: string;
  description: string;
  benchmarks: IMachineBenchmarks;
  tips: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MachineSchema = new Schema<IMachine>(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"],
      default: "Chest",
    },
    picture: {
      type: String,
      default: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&auto=format&fit=crop&q=80",
    },
    description: { type: String, default: "" },
    benchmarks: {
      beginner: { type: Number, default: 40 },
      intermediate: { type: Number, default: 70 },
      advanced: { type: Number, default: 100 },
      elite: { type: Number, default: 140 },
    },
    tips: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const Machine: Model<IMachine> =
  mongoose.models.Machine || mongoose.model<IMachine>("Machine", MachineSchema);

export default Machine;
