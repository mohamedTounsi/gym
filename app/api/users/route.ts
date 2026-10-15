import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import WorkoutSession from "@/models/WorkoutSession";

export async function GET() {
  try {
    await connectDB();
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();

    // Attach total workouts count for each user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const workoutCount = await WorkoutSession.countDocuments({
          userId: u._id,
          status: "completed",
        });
        return {
          ...u,
          workoutCount,
        };
      })
    );

    return NextResponse.json({ users: usersWithStats });
  } catch (error: any) {
    console.error("Fetch users error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500 });
  }
}
