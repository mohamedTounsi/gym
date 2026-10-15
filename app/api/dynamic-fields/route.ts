import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DynamicField from "@/models/DynamicField";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const fields = await DynamicField.find().sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json({ fields });
  } catch (error: any) {
    console.error("Fetch dynamic fields error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch fields" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can add profile fields" }, { status: 403 });
    }

    const { label, type, options, placeholder, description, required } = await req.json();

    if (!label) {
      return NextResponse.json({ error: "Field label is required" }, { status: 400 });
    }

    await connectDB();

    const key = label
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_");

    const existing = await DynamicField.findOne({ key });
    if (existing) {
      return NextResponse.json(
        { error: "A field with a similar name already exists" },
        { status: 400 }
      );
    }

    const count = await DynamicField.countDocuments();

    const newField = await DynamicField.create({
      label,
      key,
      type: type || "text",
      options: Array.isArray(options) ? options : [],
      placeholder: placeholder || "",
      description: description || "",
      required: !!required,
      order: count + 1,
    });

    return NextResponse.json({ field: newField }, { status: 201 });
  } catch (error: any) {
    console.error("Create dynamic field error:", error);
    return NextResponse.json({ error: error.message || "Failed to create field" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can delete fields" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Field ID is required" }, { status: 400 });
    }

    await connectDB();
    await DynamicField.findByIdAndDelete(id);

    return NextResponse.json({ message: "Field deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete field" }, { status: 500 });
  }
}
