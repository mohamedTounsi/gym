import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import BroFeed from "@/models/BroFeed";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const feed = await BroFeed.find().sort({ createdAt: -1 }).limit(30).lean();
    return NextResponse.json({ feed });
  } catch (error: any) {
    console.error("Fetch feed error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch feed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { feedId, cheerEmoji } = await req.json();

    await connectDB();

    const post = await BroFeed.findById(feedId);
    if (!post) {
      return NextResponse.json({ error: "Feed item not found" }, { status: 404 });
    }

    const cheerText = `${user.name} ${cheerEmoji || "💪"}`;
    if (!post.likes.includes(cheerText)) {
      post.likes.push(cheerText);
      await post.save();
    }

    return NextResponse.json({ message: "Cheered!", post });
  } catch (error: any) {
    console.error("Cheer feed error:", error);
    return NextResponse.json({ error: error.message || "Failed to cheer" }, { status: 500 });
  }
}
