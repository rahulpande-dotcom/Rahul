import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId") || undefined;
    const hospitalId = searchParams.get("hospitalId") || undefined;
    const visitId = searchParams.get("visitId") || undefined;

    const bills = await db.getBills({ patientId, hospitalId, visitId });
    return NextResponse.json(bills);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch bills" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.patientId || !body.patientName || !body.uhid || !Array.isArray(body.items)) {
      return NextResponse.json(
        { error: "patientId, patientName, uhid, and items array are required" },
        { status: 400 }
      );
    }
    const bill = await db.createBill(body);
    return NextResponse.json(bill, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create bill" }, { status: 400 });
  }
}
