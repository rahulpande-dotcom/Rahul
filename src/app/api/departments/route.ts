import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const depts = await db.getDepartments();
  return NextResponse.json(depts);
}
