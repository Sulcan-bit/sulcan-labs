// app/api/condensate/scenario/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const scenario = await prisma.condensateScenario.findUnique({
      where: { id: Number(params.id) },
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
