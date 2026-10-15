import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Machine from "@/models/Machine";
import WorkoutSession from "@/models/WorkoutSession";
import { getCurrentUser } from "@/lib/auth";
import { getDefaultBenchmarks } from "@/lib/encouragement";

export async function GET() {
  try {
    await connectDB();
    const machines = await Machine.find().sort({ createdAt: -1 }).lean();

    // Fetch all completed workout sessions to calculate machine stats and top lifters
    const sessions = await WorkoutSession.find({ status: "completed" }).lean();

    const machinesWithStats = machines.map((machine) => {
      // Find all logs for this machine
      const liftersMap = new Map<string, { userId: string; userName: string; userAvatar: string; maxWeight: number }>();

      sessions.forEach((session) => {
        session.logs?.forEach((log) => {
          if (log.machineId?.toString() === machine._id.toString() || log.machineName.toLowerCase() === machine.name.toLowerCase()) {
            const uId = session.userId.toString();
            const existing = liftersMap.get(uId);
            if (!existing || log.maxWeight > existing.maxWeight) {
              liftersMap.set(uId, {
                userId: uId,
                userName: session.userName,
                userAvatar: session.userAvatar,
                maxWeight: log.maxWeight,
              });
            }
          }
        });
      });

      const lifters = Array.from(liftersMap.values()).sort((a, b) => b.maxWeight - a.maxWeight);
      const topLifter = lifters[0] || null;

      return {
        ...machine,
        totalLifters: lifters.length,
        topLifter,
        recordWeight: topLifter ? topLifter.maxWeight : 0,
      };
    });

    return NextResponse.json({ machines: machinesWithStats });
  } catch (error: any) {
    console.error("Fetch machines error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch machines" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Only admins can add machines" }, { status: 403 });
    }

    const { name, category, picture, description, benchmarks, tips } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Machine name is required" }, { status: 400 });
    }

    await connectDB();

    const defaultB = getDefaultBenchmarks(category || "Chest", name);
    const finalBenchmarks = {
      beginner: benchmarks?.beginner ? Number(benchmarks.beginner) : defaultB.beginner,
      intermediate: benchmarks?.intermediate ? Number(benchmarks.intermediate) : defaultB.intermediate,
      advanced: benchmarks?.advanced ? Number(benchmarks.advanced) : defaultB.advanced,
      elite: benchmarks?.elite ? Number(benchmarks.elite) : defaultB.elite,
    };

    const newMachine = await Machine.create({
      name,
      category: category || "Chest",
      picture:
        picture ||
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&auto=format&fit=crop&q=80",
      description: description || "",
      benchmarks: finalBenchmarks,
      tips: Array.isArray(tips) ? tips : tips ? [tips] : ["Focus on controlled eccentric phase.", "Squeeze hard at peak contraction."],
    });

    return NextResponse.json({ machine: newMachine }, { status: 201 });
  } catch (error: any) {
    console.error("Create machine error:", error);
    return NextResponse.json({ error: error.message || "Failed to create machine" }, { status: 500 });
  }
}
