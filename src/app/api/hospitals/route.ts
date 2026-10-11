import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get("district");

    let hospitals = await db.getHospitals();
    if (district && district !== "ALL") {
      hospitals = hospitals.filter((h) => h.district.toLowerCase() === district.toLowerCase());
    }
    return NextResponse.json(hospitals);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch hospitals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const hospital = await db.createHospital(body);
    return NextResponse.json(hospital, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create hospital" }, { status: 400 });
  }
}
