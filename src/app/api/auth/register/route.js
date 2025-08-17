// client/src/app/api/auth/register/route.js

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const USERS_FILE = path.join(process.cwd(), "src/data/users.json");

export async function POST(request) {
  try {
    const { username, password, email } = await request.json();

    // Validation
    if (!username || !password || !email) {
      return NextResponse.json(
        { error: "Username, password, and email are required" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: "Password must be at least 4 characters" },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Read existing users
    let users = [];
    try {
      const data = await fs.readFile(USERS_FILE, "utf8");
      users = JSON.parse(data);
    } catch (error) {
      console.error("Error reading users file:", error);
      // Initialize with empty array if file doesn't exist
      users = [];
    }

    // Check if username already exists
    const existingUserByUsername = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase()
    );
    if (existingUserByUsername) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    // Check if email already exists
    const existingUserByEmail = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase()
    );
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = {
      id: Date.now(), // Simple ID generation
      username,
      password, // In production, you'd hash this
      email,
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };

    // Add to users array
    users.push(newUser);

    // Write back to file
    try {
      await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
    } catch (error) {
      console.error("Error writing users file:", error);
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Account created successfully" },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to process registration" },
      { status: 500 }
    );
  }
}
