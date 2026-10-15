import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWorkoutLog {
  machineId: mongoose.Types.ObjectId;
  machineName: string;
  category?: string;
  maxWeight: number; // in kg
  sets?: { reps: number; weight: number }[];
  rpe?: number; // 1 to 10
  feedback?: string;
  isPr?: boolean;
}

export interface IWorkoutSession extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userAvatar: string;
  date: Date;
  status: "active" | "completed";
  startedAt: Date;
  completedAt?: Date;
  durationMinutes?: number;
  title: string;
  notes?: string;
  logs: IWorkoutLog[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutLogSchema = new Schema<IWorkoutLog>(
  {
    machineId: { type: Schema.Types.ObjectId, ref: "Machine", required: true },
    machineName: { type: String, required: true },
    category: { type: String, default: "Chest" },
    maxWeight: { type: Number, required: true, default: 0 },
    sets: [
      {
        reps: { type: Number, default: 10 },
        weight: { type: Number, default: 0 },
      },
    ],
    rpe: { type: Number, min: 1, max: 10, default: 8 },
    feedback: { type: String, default: "" },
    isPr: { type: Boolean, default: false },
  },
  { _id: false }
);

const WorkoutSessionSchema = new Schema<IWorkoutSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "completed"], default: "active" },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    durationMinutes: { type: Number, default: 0 },
    title: { type: String, default: "Heavy Gym Session" },
    notes: { type: String, default: "" },
    logs: [WorkoutLogSchema],
  },
  {
    timestamps: true,
  }
);

const WorkoutSession: Model<IWorkoutSession> =
  mongoose.models.WorkoutSession ||
  mongoose.model<IWorkoutSession>("WorkoutSession", WorkoutSessionSchema);

export default WorkoutSession;
