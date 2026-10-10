import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { TokenStatus } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await db.getTokenById(params.id);
  if (!token) {
    return NextResponse.json({ error: "Token not found" }, { status: 404 });
  }
  return NextResponse.json(token);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, doctorId, doctorName, roomNumber, symptoms } = body;

    const existing = await db.getTokenById(params.id);
    if (!existing) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser();

    const updated = await db.updateTokenStatus(existing.id, status as TokenStatus, {
      doctorId: doctorId || existing.doctorId,
      doctorName: doctorName || existing.doctorName,
      roomNumber: roomNumber || existing.roomNumber,
      symptoms: symptoms || existing.symptoms,
    });

    if (currentUser) {
      await db.createAuditLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorEmail: currentUser.email,
        actorRole: currentUser.role,
        action: `TOKEN_STATUS_${status}`,
        entityType: "TOKEN",
        entityId: existing.id,
        details: `Token ${existing.tokenNumber} status transitioned from ${existing.status} to ${status}`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      });
    }

    return NextResponse.json({ success: true, token: updated });
  } catch (err: any) {
    console.error("Update token error:", err);
    return NextResponse.json({ error: err.message || "Failed to update token" }, { status: 500 });
  }
}
