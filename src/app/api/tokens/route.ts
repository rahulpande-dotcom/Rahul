import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateTokenNumber, calculateWaitTime } from "@/lib/utils";
import { randomUUID } from "crypto";
import { Token, TokenPriority } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const departmentId = searchParams.get("departmentId");
  const doctorId = searchParams.get("doctorId");
  const status = searchParams.get("status");
  const patientId = searchParams.get("patientId");

  let tokens = await db.getTokens();

  if (departmentId && departmentId !== "ALL") {
    tokens = tokens.filter(
      (t) =>
        t.departmentId === departmentId ||
        t.departmentCode?.toLowerCase() === departmentId.toLowerCase()
    );
  }
  if (doctorId && doctorId !== "ALL") {
    tokens = tokens.filter((t) => t.doctorId === doctorId);
  }
  if (status) {
    const statuses = status.split(",");
    tokens = tokens.filter((t) => statuses.includes(t.status));
  }
  if (patientId) {
    tokens = tokens.filter((t) => t.patientId === patientId);
  }

  return NextResponse.json(tokens);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      departmentId,
      doctorId,
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      priority = "NORMAL",
      type = "ONLINE",
      symptoms,
    } = body;

    if (!departmentId || !patientName) {
      return NextResponse.json({ error: "Department and patient name are required" }, { status: 400 });
    }

    const dept = await db.getDepartmentById(departmentId);
    if (!dept) {
      return NextResponse.json({ error: "Invalid department" }, { status: 404 });
    }

    let doctor = null;
    if (doctorId) {
      doctor = await db.getDoctorById(doctorId);
    } else {
      // Auto assign first available doctor in department
      const allDocs = await db.getDoctors();
      doctor = allDocs.find((d) => d.departmentId === dept.id && d.isAvailableToday) || null;
    }

    const currentUser = await getCurrentUser();
    const isEmergency = priority === "EMERGENCY" || dept.code === "EMG";

    const tokenNumber = generateTokenNumber(dept.code, isEmergency, priority as TokenPriority);

    const newToken: Token = {
      id: randomUUID(),
      tokenNumber,
      departmentId: dept.id,
      departmentName: dept.name,
      departmentCode: dept.code,
      doctorId: doctor?.id,
      doctorName: doctor?.name,
      roomNumber: doctor?.roomNumber || "Desk 1",
      patientId: currentUser?.role === "patient" ? currentUser.id : undefined,
      patientName: patientName.trim(),
      patientAge: patientAge ? Number(patientAge) : undefined,
      patientGender,
      patientPhone,
      isEmergency,
      priority: priority as TokenPriority,
      status: "WAITING",
      type,
      queuePosition: 1, // Will be computed in db.createToken
      estimatedWaitMinutes: 10,
      symptoms: symptoms || "",
      generatedAt: new Date().toISOString(),
      checkInAt: type === "WALK_IN" ? new Date().toISOString() : undefined,
    };

    const savedToken = await db.createToken(newToken);

    await db.createAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorEmail: currentUser ? currentUser.email : "kiosk@queueless.ai",
      actorRole: currentUser ? currentUser.role : "staff",
      action: "TOKEN_ISSUED",
      entityType: "TOKEN",
      entityId: savedToken.id,
      details: `Token ${savedToken.tokenNumber} issued for ${savedToken.patientName} in ${savedToken.departmentName}. Priority: ${savedToken.priority}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, token: savedToken });
  } catch (err: any) {
    console.error("Create token error:", err);
    return NextResponse.json({ error: err.message || "Failed to create token" }, { status: 500 });
  }
}
