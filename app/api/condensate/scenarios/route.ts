// app/api/condensate/scenarios/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";   // ⭐ ADDED

export async function GET() {
  try {
    // ⭐ LOAD AUTHENTICATED USER
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ⭐ SECURE USER-ISOLATED LOOKUP
    const scenarios = await prisma.condensateScenario.findMany({
      where: { userId: user.id },
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ scenarios });
  } catch (err: any) {
    console.error("Error fetching condensate scenarios:", err);
    return NextResponse.json(
      { error: "Failed to load condensate scenarios." },
      { status: 500 }
    );
  }
}

