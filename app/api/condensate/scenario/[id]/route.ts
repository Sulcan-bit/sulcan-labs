// app/api/condensate/scenario/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";   // ⭐ ADDED

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 16.3 requires awaiting params
    const { id } = await context.params;

    // ⭐ LOAD AUTHENTICATED USER
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ⭐ SECURE SCENARIO LOOKUP
    const scenario = await prisma.condensateScenario.findFirst({
      where: { id: Number(id), userId: user.id },
    });

    if (!scenario) {
      return NextResponse.json(
        { error: "Scenario not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(scenario);
  } catch (err) {
    console.error("Error fetching scenario:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}



