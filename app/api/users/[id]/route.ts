import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import WorkoutSession from "@/models/WorkoutSession";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const user = await User.findById(id).select("-password").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's workout sessions
    const workouts = await WorkoutSession.find({ userId: id })
      .sort({ date: -1 })
      .limit(20)
      .lean();

    // Compute Personal Records (PRs) across all completed sessions
    const prMap = new Map<string, { machineName: string; maxWeight: number; date: Date }>();
    workouts.forEach((workout) => {
      workout.logs?.forEach((log) => {
        const existing = prMap.get(log.machineName);
        if (!existing || log.maxWeight > existing.maxWeight) {
          prMap.set(log.machineName, {
            machineName: log.machineName,
            maxWeight: log.maxWeight,
            date: workout.date,
          });
        }
      });
    });

    const prs = Array.from(prMap.values()).sort((a, b) => b.maxWeight - a.maxWeight);

    return NextResponse.json({
      user,
      workouts,
      prs,
    });
  } catch (error: any) {
    console.error("Get user profile error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Allow user to edit their own profile, or admin to edit any profile
    if (currentUser._id.toString() !== id && currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, avatar, height, weight, goalOfTheMonth, bio, customFields } = body;

    await connectDB();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (height !== undefined) updateData.height = Number(height);
    if (weight !== undefined) updateData.weight = Number(weight);
    if (goalOfTheMonth !== undefined) updateData.goalOfTheMonth = goalOfTheMonth;
    if (bio !== undefined) updateData.bio = bio;
    if (customFields !== undefined) updateData.customFields = customFields;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true })
      .select("-password")
      .lean();

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}
