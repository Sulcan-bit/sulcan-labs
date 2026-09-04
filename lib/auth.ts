// lib/auth.ts

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getUserFromSession() {
  try {
    const cookieStore = await cookies();
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

export async function requireAuth() {
  const user = await getUserFromSession();
  if (!user) redirect("/login");
  return user;
}


