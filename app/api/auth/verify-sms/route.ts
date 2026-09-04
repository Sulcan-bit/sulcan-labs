// app/api/auth/verify-sms/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, phone, code } = await req.json();

    // ------------------------------------------------------------
    // REQUIRED FIELDS
    // ------------------------------------------------------------
    if (!email || !phone || !code) {
      return NextResponse.json(
        { error: "Email, phone, and code are required." },
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
    // LOOK UP USER BY EMAIL
    // ------------------------------------------------------------
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }


    // ------------------------------------------------------------
    // PHONE MUST MATCH STORED PHONE
    // ------------------------------------------------------------
    if (!user.phone || user.phone !== normalizedPhone) {
      return NextResponse.json(
        { error: "Email and phone number do not match any account." },
        { status: 403 }
      );
    }


    // ------------------------------------------------------------
    // CODE MUST EXIST
    // ------------------------------------------------------------
    if (!user.sms_code || !user.sms_code_expires) {
      return NextResponse.json(
        { error: "Invalid or expired code." },
        { status: 401 }
      );
    }


    // ------------------------------------------------------------
    // CHECK EXPIRY
    // ------------------------------------------------------------
    const now = new Date();
    if (user.sms_code_expires < now) {
      return NextResponse.json(
        { error: "SMS code has expired." },
        { status: 401 }
      );
    }


    // ------------------------------------------------------------
    // CHECK CODE MATCH
    // ------------------------------------------------------------
    if (user.sms_code !== code) {
      return NextResponse.json(
        { error: "Invalid SMS code." },
        { status: 401 }
      );
    }


    // ------------------------------------------------------------
    // CLEAR CODE + UPDATE LAST LOGIN
    // ------------------------------------------------------------
    await prisma.user.update({
      where: { id: user.id },
      data: {
        sms_code: null,
        sms_code_expires: null,
        last_login: new Date(),
      },
    });


    // ------------------------------------------------------------
    // CREATE JWT SESSION
    // ------------------------------------------------------------
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );


    // ------------------------------------------------------------
    // SET COOKIE
    // ------------------------------------------------------------
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
       secure: true,
       sameSite: "lax",
       domain: "sulcan.com",
       path: "/",
       maxAge: 60 * 60 * 24 * 7,
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








