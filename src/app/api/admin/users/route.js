// client/src/app/api/admin/users/route.js

import { NextResponse } from "next/server";
import { mockUsers } from "../../../../data/users";

export async function GET(request) {
  // In a real app you'd check request.cookies.get("token") and verify isAdmin here
  return NextResponse.json(mockUsers);
}
