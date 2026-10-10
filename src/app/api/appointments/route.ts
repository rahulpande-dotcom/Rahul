import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateTokenNumber } from "@/lib/utils";
import { Appointment, Token } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patientId");
  const doctorId = searchParams.get("doctorId");
  const date = searchParams.get("date");

  let appointments = await db.getAppointments();

  if (patientId) {
    appointments = appointments.filter((a) => a.patientId === patientId);
  }
  if (doctorId) {
    appointments = appointments.filter((a) => a.doctorId === doctorId);
  }
  if (date) {
    appointments = appointments.filter((a) => a.date === date);
  }

  return NextResponse.json(appointments);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      patientId,
      patientName,
      patientPhone,
      patientEmail,
      doctorId,
      departmentId,
      date,
      timeSlot,
      reason,
      autoGenerateToken,
    } = body;

    if (!doctorId || !departmentId || !date || !timeSlot || !patientName) {
      return NextResponse.json({ error: "Missing required booking details" }, { status: 400 });
    }

    const doctor = await db.getDoctorById(doctorId);
    const department = await db.getDepartmentById(departmentId);
    const currentUser = await getCurrentUser();

    if (!doctor || !department) {
      return NextResponse.json({ error: "Invalid doctor or department" }, { status: 404 });
    }

    const isToday = date === new Date().toISOString().split("T")[0];
    let createdTokenId: string | undefined = undefined;

    // If appointment is for today or autoGenerateToken is true, issue token immediately
    if (isToday || autoGenerateToken) {
      const tokenNumber = generateTokenNumber(department.code, false, "NORMAL");
      const token: Token = {
        id: `tok-${Date.now()}`,
        tokenNumber,
        departmentId: department.id,
        departmentName: department.name,
        departmentCode: department.code,
        doctorId: doctor.id,
        doctorName: doctor.name,
        roomNumber: doctor.roomNumber,
        patientId: patientId || currentUser?.id,
        patientName: patientName.trim(),
        patientPhone: patientPhone || currentUser?.phone,
        isEmergency: false,
        priority: "NORMAL",
        status: "WAITING",
        type: "ONLINE",
        queuePosition: 1,
        estimatedWaitMinutes: 15,
        symptoms: reason || "Scheduled Appointment",
        generatedAt: new Date().toISOString(),
        checkInAt: isToday ? new Date().toISOString() : undefined,
      };

      const savedToken = await db.createToken(token);
      createdTokenId = savedToken.id;
    }

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: patientId || currentUser?.id || `anon-${Date.now()}`,
      patientName: patientName.trim(),
      patientPhone: patientPhone || "",
      patientEmail: patientEmail || currentUser?.email || "",
      doctorId: doctor.id,
      doctorName: doctor.name,
      departmentId: department.id,
      departmentName: department.name,
      date,
      timeSlot,
      reason: reason || "General Consultation",
      status: isToday ? "CHECKED_IN" : "CONFIRMED",
      tokenId: createdTokenId,
      createdAt: new Date().toISOString(),
    };

    const saved = await db.createAppointment(newAppointment);

    await db.createAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorEmail: currentUser ? currentUser.email : "guest@queueless.ai",
      actorRole: currentUser ? currentUser.role : "patient",
      action: "APPOINTMENT_BOOKED",
      entityType: "APPOINTMENT",
      entityId: saved.id,
      details: `Appointment booked with ${doctor.name} on ${date} at ${timeSlot}. Token: ${createdTokenId || "None"}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, appointment: saved, tokenId: createdTokenId });
  } catch (err: any) {
    console.error("Book appointment error:", err);
    return NextResponse.json({ error: err.message || "Failed to book appointment" }, { status: 500 });
  }
}
