import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { departmentId, doctorId } = body;

    const allTokens = await db.getTokens();

    // Filter waiting tokens for this department or doctor
    const waitingTokens = allTokens.filter((t) => {
      const matchDept = departmentId ? t.departmentId === departmentId : true;
      const matchDoc = doctorId ? t.doctorId === doctorId : true;
      return (matchDept || matchDoc) && t.status === "WAITING";
    });

    if (waitingTokens.length === 0) {
      return NextResponse.json({ message: "No patients currently waiting in this queue", token: null });
    }

    // Sort by priority (EMERGENCY -> SENIOR_CITIZEN -> NORMAL), then by generatedAt
    waitingTokens.sort((a, b) => {
      const priorityOrder = { EMERGENCY: 0, SENIOR_CITIZEN: 1, NORMAL: 2 };
      const pDiff = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      if (pDiff !== 0) return pDiff;
      return new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime();
    });

    const nextToken = waitingTokens[0];
    const currentUser = await getCurrentUser();

    // Call the token
    const doctor = doctorId ? await db.getDoctorById(doctorId) : null;
    const updated = await db.updateTokenStatus(nextToken.id, "CALLED", {
      doctorId: doctor?.id || nextToken.doctorId,
      doctorName: doctor?.name || nextToken.doctorName,
      roomNumber: doctor?.roomNumber || nextToken.roomNumber,
    });

    if (currentUser) {
      await db.createAuditLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorEmail: currentUser.email,
        actorRole: currentUser.role,
        action: "TOKEN_CALLED_NEXT",
        entityType: "TOKEN",
        entityId: nextToken.id,
        details: `Doctor/Staff called next token: ${nextToken.tokenNumber} (${nextToken.patientName}) to ${updated?.roomNumber || "OPD"}`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      });
    }

    return NextResponse.json({ success: true, token: updated });
  } catch (err: any) {
    console.error("Call next token error:", err);
    return NextResponse.json({ error: err.message || "Failed to call next token" }, { status: 500 });
  }
}
