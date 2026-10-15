import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: "admin" | "member";
  avatar: string;
  height?: number; // in cm
  weight?: number; // in kg
  goalOfTheMonth?: string;
  bio?: string;
  streak: number;
  lastWorkoutDate?: Date;
  customFields?: Record<string, string | number>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    avatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    },
    height: { type: Number, default: 178 },
    weight: { type: Number, default: 78 },
    goalOfTheMonth: { type: String, default: "Hit 100kg Bench Press & stay consistent!" },
    bio: { type: String, default: "Iron never lies to you. 5 days a week grind." },
    streak: { type: Number, default: 0 },
    lastWorkoutDate: { type: Date },
    customFields: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite in development hot reloading
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
