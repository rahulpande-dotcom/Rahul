import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const logs = await db.getAuditLogs();
  return NextResponse.json(logs);
}
