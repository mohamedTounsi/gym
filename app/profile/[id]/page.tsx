import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import WorkoutSession from "@/models/WorkoutSession";
import DynamicField from "@/models/DynamicField";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import ProfileView from "@/components/ProfileView";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }

  const user = await User.findById(id).select("-password").lean();
  if (!user) {
    notFound();
  }

  // Fetch dynamic fields
  const dynamicFields = await DynamicField.find().sort({ order: 1 }).lean();

  // Fetch workouts
  const workouts = await WorkoutSession.find({ userId: id, status: "completed" })
    .sort({ date: -1 })
    .lean();

  // Calculate PRs per machine
  const prMap = new Map<string, { machineName: string; maxWeight: number; date: Date }>();
  workouts.forEach((w) => {
    w.logs?.forEach((l) => {
      const existing = prMap.get(l.machineName);
      if (!existing || l.maxWeight > existing.maxWeight) {
        prMap.set(l.machineName, {
          machineName: l.machineName,
          maxWeight: l.maxWeight,
          date: w.date,
        });
      }
    });
  });

  const prs = Array.from(prMap.values()).sort((a, b) => b.maxWeight - a.maxWeight);

  const canEdit =
    currentUser._id.toString() === id || currentUser.role === "admin";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileView
          initialUser={JSON.parse(JSON.stringify(user))}
          dynamicFields={JSON.parse(JSON.stringify(dynamicFields))}
          workouts={JSON.parse(JSON.stringify(workouts))}
          prs={JSON.parse(JSON.stringify(prs))}
          canEdit={canEdit}
        />
      </main>
    </div>
  );
}
