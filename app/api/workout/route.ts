import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WorkoutSession from "@/models/WorkoutSession";
import Machine from "@/models/Machine";
import User from "@/models/User";
import BroFeed from "@/models/BroFeed";
import { getCurrentUser } from "@/lib/auth";
import { evaluateStrength } from "@/lib/encouragement";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Check for an active session
    const activeSession = await WorkoutSession.findOne({
      userId: user._id,
      status: "active",
    }).lean();

    // Get recent past workouts
    const pastWorkouts = await WorkoutSession.find({
      userId: user._id,
      status: "completed",
    })
      .sort({ completedAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      activeSession,
      pastWorkouts,
    });
  } catch (error: any) {
    console.error("Get workout error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch workouts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, notes } = await req.json().catch(() => ({}));

    await connectDB();

    // Check if there is already an active workout
    let activeSession = await WorkoutSession.findOne({
      userId: user._id,
      status: "active",
    });

    if (activeSession) {
      return NextResponse.json({
        message: "Active session resumed",
        session: activeSession,
      });
    }

    activeSession = await WorkoutSession.create({
      userId: user._id,
      userName: user.name,
      userAvatar: user.avatar,
      status: "active",
      startedAt: new Date(),
      title: title || "Iron Day: Let's Crush It!",
      notes: notes || "",
      logs: [],
    });

    // Create check-in post in BroFeed
    await BroFeed.create({
      userId: user._id,
      userName: user.name,
      userAvatar: user.avatar,
      type: "checkin",
      message: `${user.name} just stepped into the gym! Iron session started! 🔥💪`,
      likes: [],
    });

    return NextResponse.json({
      message: "Gym Day Started! Time to lift!",
      session: activeSession,
    });
  } catch (error: any) {
    console.error("Start workout error:", error);
    return NextResponse.json({ error: error.message || "Failed to start workout" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, machineId, maxWeight, sets, rpe, sessionId, notes, title } = body;

    await connectDB();

    const session = await WorkoutSession.findOne({
      userId: user._id,
      status: "active",
    });

    if (!session) {
      return NextResponse.json({ error: "No active gym session found" }, { status: 404 });
    }

    // ACTION: LOG A MACHINE
    if (action === "log_machine") {
      const machine = await Machine.findById(machineId);
      if (!machine) {
        return NextResponse.json({ error: "Machine not found" }, { status: 404 });
      }

      const numericWeight = Number(maxWeight);

      // Check if user has an existing PR on this machine
      const pastSessions = await WorkoutSession.find({
        userId: user._id,
        status: "completed",
      }).lean();

      let previousBest = 0;
      pastSessions.forEach((s) => {
        s.logs?.forEach((l) => {
          if (l.machineId?.toString() === machine._id.toString() || l.machineName === machine.name) {
            if (l.maxWeight > previousBest) previousBest = l.maxWeight;
          }
        });
      });

      const isPr = numericWeight > previousBest && previousBest > 0;

      // Calculate encouragement based on dataset
      const userWeight = user.weight || 78;
      const strengthEval = evaluateStrength(
        machine.name,
        machine.category,
        numericWeight,
        userWeight,
        machine.benchmarks
      );

      const newLog = {
        machineId: machine._id,
        machineName: machine.name,
        category: machine.category,
        maxWeight: numericWeight,
        sets: sets && sets.length ? sets : [{ reps: 10, weight: numericWeight }],
        rpe: rpe ? Number(rpe) : 8,
        feedback: strengthEval.message,
        isPr,
      };

      // If user already logged this machine in the current session, update it or append
      const existingLogIndex = session.logs.findIndex(
        (l) => l.machineId.toString() === machine._id.toString()
      );

      if (existingLogIndex >= 0) {
        session.logs[existingLogIndex] = newLog as any;
      } else {
        session.logs.push(newLog as any);
      }

      await session.save();

      // If PR or heavy milestone, post to BroFeed!
      if (isPr || strengthEval.tier === "Titan" || strengthEval.tier === "Elite") {
        await BroFeed.create({
          userId: user._id,
          userName: user.name,
          userAvatar: user.avatar,
          type: "pr",
          message: `${user.name} smashed a NEW PR: ${numericWeight}kg on the ${machine.name}! 🚀 ${strengthEval.badge}`,
          machineName: machine.name,
          weight: numericWeight,
          likes: [],
        });
      }

      return NextResponse.json({
        message: "Weight charged & logged successfully!",
        log: newLog,
        strengthEval,
        isPr,
        session,
      });
    }

    // ACTION: COMPLETE WORKOUT
    if (action === "finish") {
      const now = new Date();
      const durationMs = now.getTime() - new Date(session.startedAt).getTime();
      const durationMinutes = Math.max(1, Math.round(durationMs / 60000));

      session.status = "completed";
      session.completedAt = now;
      session.durationMinutes = durationMinutes;
      if (notes) session.notes = notes;
      if (title) session.title = title;

      await session.save();

      // Update user streak & lastWorkoutDate
      const dbUser = await User.findById(user._id);
      if (dbUser) {
        const lastDate = dbUser.lastWorkoutDate ? new Date(dbUser.lastWorkoutDate) : null;
        const today = new Date();
        const isConsecutive =
          lastDate &&
          Math.abs(today.getTime() - lastDate.getTime()) <= 48 * 3600 * 1000;

        dbUser.streak = isConsecutive ? dbUser.streak + 1 : 1;
        dbUser.lastWorkoutDate = now;
        await dbUser.save();
      }

      // Post workout completion to BroFeed
      const totalWeightMoved = session.logs.reduce((acc, l) => acc + l.maxWeight, 0);
      await BroFeed.create({
        userId: user._id,
        userName: user.name,
        userAvatar: user.avatar,
        type: "workout_completed",
        message: `${user.name} finished workout: "${session.title}" (${session.logs.length} machines crushed, ${durationMinutes} mins)! 💯`,
        likes: [],
      });

      return NextResponse.json({
        message: "Workout completed and locked in history! Great job!",
        session,
      });
    }

    // ACTION: CANCEL
    if (action === "cancel") {
      await WorkoutSession.findByIdAndDelete(session._id);
      return NextResponse.json({ message: "Active workout session cancelled." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Update workout error:", error);
    return NextResponse.json({ error: error.message || "Failed to update workout" }, { status: 500 });
  }
}
