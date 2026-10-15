import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { connectDB } from "./mongodb";
import User, { IUser } from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "gym-secret-titan-key-848392019";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<IUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("gym_auth_token")?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload?.userId) return null;

    await connectDB();
    const user = await User.findById(payload.userId).select("-password").lean();
    return user as unknown as IUser;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
