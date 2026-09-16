// app/api/condensate/scenario/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const id = Number(context.params.id);

    const scenario = await prisma.condensateScenario.findUnique({
      where: { id },
    });

    if (!scenario) {
      return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
    }

    return NextResponse.json(scenario);
  } catch (err) {
    console.error("Error fetching scenario:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

