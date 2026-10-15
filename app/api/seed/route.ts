import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Machine from "@/models/Machine";
import WorkoutSession from "@/models/WorkoutSession";
import DynamicField from "@/models/DynamicField";
import BroFeed from "@/models/BroFeed";
import { hashPassword } from "@/lib/auth";

export async function POST() {
  try {
    await connectDB();

    // 1. Clear existing users, workouts, and feeds
    await User.deleteMany({});
    await WorkoutSession.deleteMany({});
    await BroFeed.deleteMany({});

    // Keep or re-seed machines if empty
    const machineCount = await Machine.countDocuments();
    if (machineCount === 0) {
      await Machine.insertMany([
        {
          name: "Incline Chest Press Machine",
          category: "Chest",
          picture: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&auto=format&fit=crop&q=80",
          description: "Iso-lateral converging incline press targeting the upper pectorals with zero shoulder impingement.",
          benchmarks: { beginner: 40, intermediate: 75, advanced: 105, elite: 140 },
          tips: ["Retract your scapula before pressing.", "Keep elbows at a 45-degree angle."],
        },
        {
          name: "45° Incline Leg Press",
          category: "Legs",
          picture: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80",
          description: "Heavy-duty 45-degree plate-loaded sled machine for quadriceps and glutes.",
          benchmarks: { beginner: 120, intermediate: 200, advanced: 280, elite: 380 },
          tips: ["Never fully lock out your knees at the top.", "Drive through the heels."],
        },
        {
          name: "Wide Grip Lat Pulldown",
          category: "Back",
          picture: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80",
          description: "Pin-selected dual pulley cable station for building maximum lat width.",
          benchmarks: { beginner: 45, intermediate: 70, advanced: 95, elite: 120 },
          tips: ["Lead with your elbows.", "Control the negative stretch."],
        },
        {
          name: "Seated Overhead Shoulder Press",
          category: "Shoulders",
          picture: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80",
          description: "Ergonomic seated military overhead machine for anterior and lateral deltoids.",
          benchmarks: { beginner: 35, intermediate: 60, advanced: 85, elite: 110 },
          tips: ["Brace your core tight against the backrest."],
        },
        {
          name: "Seated Cable Row Station",
          category: "Back",
          picture: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
          description: "Low pulley cable row targeting rhomboids and lat thickness.",
          benchmarks: { beginner: 40, intermediate: 70, advanced: 95, elite: 125 },
          tips: ["Keep your chest proud and spine neutral."],
        },
      ]);
    }

    // Dynamic Fields
    const fieldCount = await DynamicField.countDocuments();
    if (fieldCount === 0) {
      await DynamicField.insertMany([
        {
          label: "Body Fat %",
          key: "body_fat_percentage",
          type: "number",
          placeholder: "e.g. 12",
          description: "Current estimated body fat percentage",
          required: false,
          order: 1,
        },
        {
          label: "Bench Press 1RM Target (kg)",
          key: "bench_target",
          type: "number",
          placeholder: "e.g. 120",
          description: "Your ultimate bench press goal",
          required: false,
          order: 2,
        },
        {
          label: "Favorite Pre-Workout",
          key: "fav_pre_workout",
          type: "text",
          placeholder: "e.g. Gorilla Mode Fruit Punch",
          description: "What fuels your lifting session",
          required: false,
          order: 3,
        },
      ]);
    }

    const commonPassword = await hashPassword("gymbro123");
    const svgAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="100" fill="%23dc2626"/><text x="50%" y="54%" font-size="105" font-family="Arial, Helvetica, sans-serif" font-weight="900" fill="%23ffffff" text-anchor="middle" dominant-baseline="central">A</text></svg>`;

    // Insert ONLY Admin
    const admin = await User.create({
      name: "Admin",
      email: "admin@titangym.com",
      password: commonPassword,
      role: "admin",
      avatar: svgAvatar,
      height: 180,
      weight: 80,
      goalOfTheMonth: "Lead the brotherhood and dominate the weights!",
      bio: "Gym Administrator",
      streak: 0,
      customFields: {},
    });

    return NextResponse.json({
      message: "Database reset: Only Admin exists now. Ready for fresh member signups!",
      admin: {
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message || "Failed to reset database" }, { status: 500 });
  }
}
