import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateTokenNumber } from "@/lib/utils";
import { EmergencyCase, Token } from "@/lib/types";

export async function GET() {
  const cases = await db.getEmergencyCases();
  return NextResponse.json(cases);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      patientName = "Unidentified Emergency Patient",
      approxAge,
      gender = "other",
      triageLevel = "LEVEL_1_RESUSCITATION",
      chiefComplaint,
      consciousness = "ALERT",
      arrivalType = "WALK_IN",
      contactPerson,
      contactPhone,
      assignedBay = "ER Bay 1",
    } = body;

    if (!chiefComplaint) {
      return NextResponse.json({ error: "Chief emergency complaint or trauma reason is required" }, { status: 400 });
    }

    const tokenNumber = generateTokenNumber("EMG", true, "EMERGENCY");
    const erDept = (await db.getDepartments()).find((d) => d.code === "EMG") || {
      id: "dept-emg",
      name: "Emergency & Trauma",
      code: "EMG",
    };

    const newCase: EmergencyCase = {
      id: `emg-${Date.now()}`,
      tokenNumber,
      patientName: patientName.trim(),
      approxAge: approxAge ? Number(approxAge) : undefined,
      gender,
      triageLevel,
      chiefComplaint: chiefComplaint.trim(),
      consciousness,
      arrivalType,
      contactPerson,
      contactPhone,
      assignedBay,
      doctorName: "ER Attending Physician",
      status: "TRIAGED",
      registeredAt: new Date().toISOString(),
    };

    // Also generate active top-priority emergency token in queue
    const emergencyToken: Token = {
      id: `tok-emg-${Date.now()}`,
      tokenNumber,
      departmentId: erDept.id,
      departmentName: erDept.name,
      departmentCode: "EMG",
      doctorName: "ER Attending Physician",
      roomNumber: assignedBay,
      patientName: newCase.patientName,
      patientAge: newCase.approxAge,
      patientGender: newCase.gender,
      isEmergency: true,
      priority: "EMERGENCY",
      status: "CALLED", // Emergency patients are called immediately
      type: "EMERGENCY",
      queuePosition: 1,
      estimatedWaitMinutes: 0,
      symptoms: `[EMERGENCY ${triageLevel}]: ${chiefComplaint}`,
      generatedAt: new Date().toISOString(),
      checkInAt: new Date().toISOString(),
      calledAt: new Date().toISOString(),
    };

    await db.createEmergencyCase(newCase);
    await db.createToken(emergencyToken);

    await db.createAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorEmail: "emergency-public@queueless.ai",
      actorRole: "staff",
      action: "EMERGENCY_INTAKE_RECORDED",
      entityType: "EMERGENCY",
      entityId: newCase.id,
      details: `Emergency Case ${newCase.tokenNumber} created: ${newCase.patientName} (${newCase.triageLevel}). Bay: ${newCase.assignedBay}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      emergencyCase: newCase,
      token: emergencyToken,
    });
  } catch (err: any) {
    console.error("Emergency registration error:", err);
    return NextResponse.json({ error: err.message || "Failed to process emergency registration" }, { status: 500 });
  }
}
