import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateClinicalAssistance } from "@/lib/ai-clinical-support";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const visitId = searchParams.get("visitId") || undefined;
    const patientId = searchParams.get("patientId") || undefined;
    const doctorId = searchParams.get("doctorId") || undefined;

    const suggestions = await db.getAiClinicalSuggestions({ visitId, patientId, doctorId });
    return NextResponse.json({ suggestions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch suggestions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, doctorId, symptoms, vitals, knownAllergies, currentMedications, visitId } = body;

    if (!patientId || !doctorId || !symptoms) {
      return NextResponse.json(
        { error: "patientId, doctorId, and symptoms are required" },
        { status: 400 }
      );
    }

    const generated = generateClinicalAssistance({
      patientId,
      doctorId,
      symptoms,
      vitals,
      knownAllergies,
      currentMedications,
      visitId,
    });

    const suggestion = await db.createAiClinicalSuggestion({
      id: randomUUID(),
      ...generated,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ suggestion }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate AI suggestion" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, clinicianEdits, approvedByDoctorName } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    const updated = await db.updateAiClinicalSuggestionStatus(
      id,
      status,
      clinicianEdits,
      approvedByDoctorName
    );

    if (!updated) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
    }

    return NextResponse.json({ suggestion: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update suggestion" }, { status: 500 });
  }
}
