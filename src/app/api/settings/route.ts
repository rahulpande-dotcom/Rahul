import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await db.getSettings();
  const supabaseConnected = isSupabaseConfigured();
  return NextResponse.json({
    settings,
    databaseStatus: {
      supabaseConnected,
      mode: supabaseConnected ? "Supabase PostgreSQL (Live)" : "Local Persistent Engine (Active)",
      tablesConfigured: 9,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await db.updateSettings(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update settings" }, { status: 500 });
  }
}
