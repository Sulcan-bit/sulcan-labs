// lib/auth.ts

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.JWT_SECRET!;

/**
 * Reads the JWT session cookie and returns the authenticated user.
 * Returns null if no valid session exists.
 */
export async function getUserFromSession() {
  try {
    // ⭐ FIX FOR NEXT.JS 16 — cookies() MUST BE AWAITED
    const cookieStore = await cookies();
    const token = cookieStore.get("sulcan_session")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, SECRET) as {
      userId: number;
      email: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    return user || null;
  } catch (err) {
    console.error("Session validation error:", err);
    return null;
  }
}

/**
 * Protects server components and API routes.
 * Throws if no valid session exists.
 */
export async function requireAuth() {
  const user = await getUserFromSession();
  if (!user) throw new Error("Unauthorized");
  return user;
}



