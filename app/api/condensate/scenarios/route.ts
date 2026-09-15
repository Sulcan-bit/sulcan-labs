// app/api/condensate/scenarios/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const scenarios = await prisma.condensateScenario.findMany({
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
