import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBroFeed extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userAvatar: string;
  type: "checkin" | "pr" | "workout_completed";
  message: string;
  machineName?: string;
  weight?: number;
  likes: string[]; // array of user names who cheered
  createdAt: Date;
}

const BroFeedSchema = new Schema<IBroFeed>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String, default: "" },
    type: {
      type: String,
      enum: ["checkin", "pr", "workout_completed"],
      default: "checkin",
    },
    message: { type: String, required: true },
    machineName: { type: String },
    weight: { type: Number },
    likes: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const BroFeed: Model<IBroFeed> =
  mongoose.models.BroFeed || mongoose.model<IBroFeed>("BroFeed", BroFeedSchema);

export default BroFeed;
