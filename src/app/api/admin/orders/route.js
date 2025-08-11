// client/src/app/api/admin/orders/route.js
import { NextResponse } from "next/server";
import { mockOrders } from "../../../../data/orders";

export async function GET(request) {
  // TODO: verify admin via request.cookies
  return NextResponse.json(mockOrders);
}
