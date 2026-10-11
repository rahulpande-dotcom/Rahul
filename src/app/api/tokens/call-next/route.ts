import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { departmentId, doctorId } = body;

    const currentUser = await getCurrentUser();

    // Call next token using concurrency-safe atomic helper
    const token = await db.callNextWaitingToken({
      departmentId,
      doctorId,
      callerEmail: currentUser?.email,
      callerRole: currentUser?.role,
    });

    if (!token) {
      return NextResponse.json({
        message: "No patients currently waiting in this queue",
        token: null,
      });
    }

    if (currentUser) {
      await db.createAuditLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorEmail: currentUser.email,
        actorRole: currentUser.role,
        action: "TOKEN_CALLED_NEXT",
        entityType: "TOKEN",
        entityId: token.id,
        details: `Staff called next token: ${token.tokenNumber} (${token.patientName}) to ${token.roomNumber || "OPD"}`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      });
    }

    return NextResponse.json({ success: true, token });
  } catch (err: any) {
    console.error("Call next token error:", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to call next token" },
      { status: 500 }
    );
  }
}
