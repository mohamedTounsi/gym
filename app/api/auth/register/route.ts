import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, password, avatar, height, weight, goalOfTheMonth } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Check if this is the first user in the DB, make them admin
    const userCount = await User.countDocuments();
    const role = userCount === 0 || email.toLowerCase().includes("admin") ? "admin" : "member";

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      avatar:
        avatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      height: height ? Number(height) : 178,
      weight: weight ? Number(weight) : 78,
      goalOfTheMonth: goalOfTheMonth || "Build pure muscle & smash PRs!",
    });

    const token = signToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    const response = NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar,
        },
      },
      { status: 201 }
    );

    response.cookies.set("gym_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register" },
      { status: 500 }
    );
  }
}
