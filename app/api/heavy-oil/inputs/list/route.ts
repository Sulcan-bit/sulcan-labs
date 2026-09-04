// app/api/heavy-oil/inputs/list/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";

export async function GET() {
  // ⭐ COOKIE-BASED AUTH (RESTORED)
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await prisma.heavyOilInputs.findMany({
    where: { userId: user.id },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(records);
}




