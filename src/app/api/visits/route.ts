import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Visit } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patientId");
  const doctorId = searchParams.get("doctorId");
  const visitNumber = searchParams.get("visitNumber");

  let visits = await db.getVisits();

  if (patientId) {
    visits = visits.filter((v) => v.patientId === patientId);
  }
  if (doctorId) {
    visits = visits.filter((v) => v.doctorId === doctorId);
  }
  if (visitNumber) {
    visits = visits.filter((v) => v.visitNumber === visitNumber);
  }

  return NextResponse.json(visits);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tokenId,
      tokenNumber,
      patientId,
      patientName,
      patientAge,
      patientGender,
      uhid,
      doctorId,
      doctorName,
      departmentName,
      roomNumber,
      symptoms,
      diagnosis,
      vitals,
      prescriptions,
      doctorAdvice,
      followUpDate,
      billingStatus = "PAID",
      billingAmount = 500,
    } = body;

    if (!patientName || !diagnosis || !doctorId) {
      return NextResponse.json({ error: "Patient name, doctor, and clinical diagnosis are required" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const visitNumber = `VST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newVisit: Visit = {
      id: `vst-${Date.now()}`,
      visitNumber,
      tokenId: tokenId || `tok-${Date.now()}`,
      tokenNumber: tokenNumber || "OPD-WALK",
      patientId: patientId || "usr-patient",
      patientName,
      patientAge: patientAge ? Number(patientAge) : undefined,
      patientGender,
      uhid: uhid || "QL-UHID-NEW",
      doctorId,
      doctorName: doctorName || "Attending Physician",
      departmentName: departmentName || "General OPD",
      roomNumber: roomNumber || "Room 101",
      visitDate: now.split("T")[0],
      checkInTimestamp: now,
      consultationTimestamp: now,
      checkoutTimestamp: now,
      symptoms: symptoms || "Routine consultation",
      diagnosis,
      vitals: vitals || {},
      prescriptions: prescriptions || [],
      doctorAdvice: doctorAdvice || "Rest and plenty of fluids.",
      followUpDate,
      billingStatus,
      billingAmount: Number(billingAmount),
      status: "COMPLETED",
    };

    const saved = await db.createVisit(newVisit);

    // If there is an active token, mark it COMPLETED
    if (tokenId) {
      await db.updateTokenStatus(tokenId, "COMPLETED", {
        completedAt: now,
      });
    }

    const currentUser = await getCurrentUser();
    await db.createAuditLog({
      id: `log-${Date.now()}`,
      timestamp: now,
      actorEmail: currentUser ? currentUser.email : "doctor@queueless.ai",
      actorRole: currentUser ? currentUser.role : "doctor",
      action: "CLINICAL_VISIT_RECORDED",
      entityType: "VISIT",
      entityId: saved.id,
      details: `Visit ${saved.visitNumber} completed for ${saved.patientName}. Diagnosis: ${saved.diagnosis}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, visit: saved });
  } catch (err: any) {
    console.error("Create visit error:", err);
    return NextResponse.json({ error: err.message || "Failed to record visit" }, { status: 500 });
  }
}
