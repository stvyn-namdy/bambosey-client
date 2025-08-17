// client/src/app/api/auth/login/route.js

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";

const SECRET = process.env.JWT_SECRET || "change-this-in-prod";
const USERS_FILE = path.join(process.cwd(), "src/data/users.json");

export async function POST(request) {
  try {
    const { username, password, remember } = await request.json();

    // Read users from file
    let users = [];
    try {
      const data = await fs.readFile(USERS_FILE, "utf8");
      users = JSON.parse(data);
    } catch (error) {
      console.error("Error reading users file:", error);
      return NextResponse.json(
        { error: "Authentication system unavailable" },
        { status: 500 }
      );
    }

    // Find user with matching credentials
    const user = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      u.password === password
    );

    if (user) {
      const token = jwt.sign(
        { username: user.username, isAdmin: user.isAdmin },
        SECRET,
        { expiresIn: remember ? "7d" : "1h" }
      );

      const res = NextResponse.json({ success: true });
      res.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: remember ? 7 * 24 * 60 * 60 : 60 * 60, // 7 days or 1 hour in seconds
        path: "/",
      });

      return res;
    } else {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to process login" },
      { status: 500 }
    );
  }
}
