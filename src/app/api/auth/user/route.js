// client/src/app/api/auth/user/route.js

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "change-this-in-prod";

export function GET(request) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ user: null });
  }

  try {
    const data = jwt.verify(token, SECRET);
    return NextResponse.json({
      user: { username: data.username, isAdmin: data.isAdmin },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
