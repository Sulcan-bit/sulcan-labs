// lib/auth.ts

import jwt from "jsonwebtoken";

export function getAuthFromRequest(req: Request) {
  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return null;

  const token = header.slice("Bearer ".length);

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      email: string;
    };
  } catch {
    return null;
  }
}

