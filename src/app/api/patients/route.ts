import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Enforce server-side role check: only admin and authorized staff can list patient accounts
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (currentUser.role !== "admin" && currentUser.role !== "staff") {
      return NextResponse.json({ error: "Access denied: Administrator privileges required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim().toLowerCase();
    const gender = searchParams.get("gender")?.trim().toLowerCase();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));

    const profiles = await db.getProfiles();
    let patients = profiles.filter((p) => p.role === "patient");

    // Search filter
    if (q) {
      patients = patients.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          (p.uhid && p.uhid.toLowerCase().includes(q)) ||
          (p.phone && p.phone.includes(q))
      );
    }

    // Gender filter
    if (gender && gender !== "all") {
      patients = patients.filter((p) => p.gender?.toLowerCase() === gender);
    }

    // Sort by registration date descending (newest first)
    patients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = patients.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = patients.slice(startIndex, startIndex + limit);

    // Sanitize records: NEVER expose passwords, password hashes, or session tokens
    const sanitizedPatients = paginated.map((p) => {
      const { password, ...safeData } = p;
      return {
        ...safeData,
        status: "ACTIVE", // Account status
      };
    });

    return NextResponse.json({
      patients: sanitizedPatients,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (err: any) {
    console.error("[API /api/patients] Error:", err.message);
    return NextResponse.json({ error: "Failed to retrieve patients" }, { status: 500 });
  }
}
