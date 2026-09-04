// app/api/auth/verify-sms/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, phone, code } = await req.json();

    if (!email || !phone || !code) {
      return NextResponse.json(
        { error: "Email, phone, and code are required." },
        { status: 400 }
      );
    }

    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      return NextResponse.json(
        { error: "Phone number must be 10 digits." },
        { status: 400 }
      );
    }

    const normalizedPhone = `+1${digits}`;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email." },
        { status: 404 }
      );
    }

    if (!user.phone || user.phone !== normalizedPhone) {
      return NextResponse.json(
        { error: "Email and phone number do not match any account." },
        { status: 403 }
      );
    }

    if (!user.sms_code || !user.sms_code_expires) {
      return NextResponse.json(
        { error: "Invalid or expired code." },
        { status: 401 }
      );
    }

    const now = new Date();
    if (user.sms_code_expires < now) {
      return NextResponse.json(
        { error: "SMS code has expired." },
        { status: 401 }
      );
    }

    if (user.sms_code !== code) {
      return NextResponse.json(
        { error: "Invalid SMS code." },
        { status: 401 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        sms_code: null,
        sms_code_expires: null,
        last_login: new Date(),
      },
    });

    // ⭐ NO COOKIES — return JWT directly
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      {
        message: "SMS login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
        },
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("Verify SMS error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

