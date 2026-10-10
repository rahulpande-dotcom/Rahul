import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const logs = await db.getAuditLogs();
  return NextResponse.json(logs);
}
