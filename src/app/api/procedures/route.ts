import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId") || undefined;
    const hospitalId = searchParams.get("hospitalId") || undefined;
    const visitId = searchParams.get("visitId") || undefined;
    const surgeonId = searchParams.get("surgeonId") || undefined;

    const procedures = await db.getProcedures({ patientId, hospitalId, visitId, surgeonId });
    return NextResponse.json(procedures);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch procedures" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.patientId || !body.procedureName || !body.leadSurgeonName || !body.departmentName || !body.operatingRoom) {
      return NextResponse.json(
        { error: "patientId, procedureName, leadSurgeonName, departmentName, and operatingRoom are required" },
        { status: 400 }
      );
    }
    const proc = await db.createProcedure(body);
    return NextResponse.json(proc, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create procedure record" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, doctorId, doctorName } = body;
    if (!id || !doctorId || !doctorName) {
      return NextResponse.json({ error: "id, doctorId, and doctorName are required for verification" }, { status: 400 });
    }
    const verified = await db.verifyProcedure(id, doctorId, doctorName);
    return NextResponse.json(verified);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to verify procedure" }, { status: 400 });
  }
}
