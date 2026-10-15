import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Machine from "@/models/Machine";
import WorkoutSession from "@/models/WorkoutSession";
import { getCurrentUser } from "@/lib/auth";
import { evaluateStrength } from "@/lib/encouragement";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const machine = await Machine.findById(id).lean();
    if (!machine) {
      return NextResponse.json({ error: "Machine not found" }, { status: 404 });
    }

    // Find all workout sessions that logged this machine
    const sessions = await WorkoutSession.find({
      $or: [
        { "logs.machineId": machine._id },
        { "logs.machineName": machine.name },
      ],
      status: "completed",
    })
      .sort({ date: -1 })
      .lean();

    // Map each user's personal best on this machine
    const liftersMap = new Map<
      string,
      {
        userId: string;
        userName: string;
        userAvatar: string;
        maxWeight: number;
        date: Date;
        rpe?: number;
        feedback?: string;
        strengthEval: any;
      }
    >();

    const recentLogs: any[] = [];

    sessions.forEach((session) => {
      session.logs?.forEach((log) => {
        if (
          log.machineId?.toString() === machine._id.toString() ||
          log.machineName.toLowerCase() === machine.name.toLowerCase()
        ) {
          const evalResult = evaluateStrength(
            machine.name,
            machine.category,
            log.maxWeight,
            78,
            machine.benchmarks
          );

          recentLogs.push({
            sessionDate: session.date,
            userName: session.userName,
            userAvatar: session.userAvatar,
            userId: session.userId,
            maxWeight: log.maxWeight,
            feedback: log.feedback || evalResult.message,
            tier: evalResult.tier,
            badge: evalResult.badge,
          });

          const uId = session.userId.toString();
          const existing = liftersMap.get(uId);
          if (!existing || log.maxWeight > existing.maxWeight) {
            liftersMap.set(uId, {
              userId: uId,
              userName: session.userName,
              userAvatar: session.userAvatar,
              maxWeight: log.maxWeight,
              date: session.date,
              rpe: log.rpe,
              feedback: log.feedback,
              strengthEval: evalResult,
            });
          }
        }
      });
    });

    const leaderboard = Array.from(liftersMap.values())
      .sort((a, b) => b.maxWeight - a.maxWeight)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    return NextResponse.json({
      machine,
      leaderboard,
      recentLogs: recentLogs.slice(0, 15),
    });
  } catch (error: any) {
    console.error("Get machine error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch machine" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Only admins can edit machines" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    await connectDB();
    const updated = await Machine.findByIdAndUpdate(id, body, { new: true }).lean();

    return NextResponse.json({ machine: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update machine" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Only admins can delete machines" }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();
    await Machine.findByIdAndDelete(id);

    return NextResponse.json({ message: "Machine deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete machine" }, { status: 500 });
  }
}
