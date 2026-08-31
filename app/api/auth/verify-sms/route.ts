// app/api/auth/verify-sms/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required." },
        { status: 400 }
      );
    }

    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.sms_code || !user.sms_code_expires) {
      return NextResponse.json(
        { error: "Invalid or expired code." },
        { status: 401 }
      );
    }

    // 2. Check expiry
    const now = new Date();
    if (user.sms_code_expires < now) {
      return NextResponse.json(
        { error: "SMS code has expired." },
        { status: 401 }
      );
    }

    // 3. Check code match
    if (user.sms_code !== code) {
      return NextResponse.json(
        { error: "Invalid SMS code." },
        { status: 401 }
      );
    }

    // 4. Clear SMS code fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        sms_code: null,
        sms_code_expires: null,
        last_login: new Date(),
      },
    });

    // 5. Create JWT session
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // 6. Set cookie
    const response = NextResponse.json(
      {
        message: "SMS login successful",
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
        },
      },
      { status: 200 }
    );

    response.cookies.set({
      name: "sulcan_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("Verify SMS error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

