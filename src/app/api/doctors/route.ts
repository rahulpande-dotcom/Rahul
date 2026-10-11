import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const departmentId = searchParams.get("departmentId");
  const hospitalId = searchParams.get("hospitalId");

  let doctors = await db.getDoctors();
  if (departmentId && departmentId !== "ALL") {
    doctors = doctors.filter((d) => d.departmentId === departmentId);
  }
  if (hospitalId && hospitalId !== "ALL") {
    doctors = doctors.filter((d) => (d.hospitalId || "hosp-queueless-blr") === hospitalId);
  }
  return NextResponse.json(doctors);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const doctor = await db.createDoctor(body);
    return NextResponse.json(doctor, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create doctor" }, { status: 400 });
  }
}
