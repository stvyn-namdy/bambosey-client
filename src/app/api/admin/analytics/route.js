// client/src/app/api/admin/analytics/route.js
import { NextResponse } from "next/server";
import { mockAnalytics } from "../../../../data/analytics";

export async function GET(_request) {
  // (In prod: verify admin via request.cookies)
  return NextResponse.json(mockAnalytics);
}
