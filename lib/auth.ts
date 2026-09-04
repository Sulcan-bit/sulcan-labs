// lib/auth.ts

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/**
 * Reads the JWT session cookie and returns the authenticated user.
 * Returns null if no valid session exists.
 */
export async function getUserFromSession() {
  try {
    const cookieStore = cookies(); // NO await
    const token = cookieStore.get("sulcan_session")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
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
 * Protects server components and pages.
 * If no valid session exists, redirects to /login.
 */
export async function requireAuth() {
  const user = await getUserFromSession();
  if (!user) redirect("/login");
  return user;
}
