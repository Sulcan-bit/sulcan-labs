// app/api/auth/register/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, phone, password, accessCode } = await req.json();

    // ------------------------------------------------------------
    // REQUIRED FIELDS
    // ------------------------------------------------------------
    if (!email || !password || !phone) {
      return NextResponse.json(
        { error: "Email, phone, and password are required." },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------
    // NORMALIZE PHONE → E.164 (+1XXXXXXXXXX)
    // ------------------------------------------------------------
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      return NextResponse.json(
        { error: "Phone number must be 10 digits." },
        { status: 400 }
      );
    }

    const normalizedPhone = `+1${digits}`;

    // ------------------------------------------------------------
    // ACCESS CODE CHECK
    // ------------------------------------------------------------
    const SECRET_ACCESS_CODE = "676767";
    if (accessCode !== SECRET_ACCESS_CODE) {
      return NextResponse.json(
        { error: "Invalid access code. Registration is restricted." },
        { status: 403 }
      );
    }

    // ------------------------------------------------------------
    // CHECK EMAIL UNIQUENESS
    // ------------------------------------------------------------
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email is already registered." },
        { status: 409 }
      );
    }

    // ------------------------------------------------------------
    // CHECK PHONE UNIQUENESS
    // ------------------------------------------------------------
    const existingPhone = await prisma.user.findFirst({
      where: { phone: normalizedPhone },
    });

    if (existingPhone) {
      return NextResponse.json(
        { error: "Phone number is already registered." },
        { status: 409 }
      );
    }

    // ------------------------------------------------------------
    // HASH PASSWORD
    // ------------------------------------------------------------
    const password_hash = await bcrypt.hash(password, 10);

    // ------------------------------------------------------------
    // CREATE USER
    // ------------------------------------------------------------
    const user = await prisma.user.create({
      data: {
        email,
        phone: normalizedPhone,
        password_hash,
      },
    });

    // ------------------------------------------------------------
    // SUCCESS RESPONSE
    // ------------------------------------------------------------
    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
