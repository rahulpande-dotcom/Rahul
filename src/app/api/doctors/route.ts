import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const departmentId = searchParams.get("departmentId");

  let doctors = await db.getDoctors();
  if (departmentId) {
    doctors = doctors.filter((d) => d.departmentId === departmentId);
  }
  return NextResponse.json(doctors);
}
