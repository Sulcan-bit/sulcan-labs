// app/api/profile/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const token = cookie
      .split(";")
      .find((c) => c.trim().startsWith("sulcan_session="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      email: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        email: user.email,
        phone: user.phone,
        first_name: user.first_name,
        last_name: user.last_name,
        address_line1: user.address_line1,
        address_line2: user.address_line2,
        city: user.city,
        province: user.province,
        postal_code: user.postal_code,
        country: user.country,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Profile error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
