import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with user credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dke6r1a4x",
  api_key: process.env.CLOUDINARY_API_KEY || "616479269693797",
  api_secret: process.env.CLOUDINARY_API_SECRET || "85vuckwUn0GG9UJ1PtWHOab5n1A",
  secure: true,
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;
    const urlInput: string | null = data.get("url") as string | null;

    // If direct image URL provided
    if (urlInput && urlInput.trim().length > 0) {
      return NextResponse.json({ url: urlInput.trim() });
    }

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;

    // Upload directly to Cloudinary using API key and secret
    const uploadResult = await cloudinary.uploader.upload(base64Data, {
      folder: "gym_uploads",
      transformation: [
        { width: 800, height: 800, crop: "limit", quality: "auto", fetch_format: "auto" },
      ],
    });

    return NextResponse.json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height,
    });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image to Cloudinary" },
      { status: 500 }
    );
  }
}
