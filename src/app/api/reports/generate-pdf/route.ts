import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generatePatientReportPdf } from "@/lib/pdf-generator";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const visitId = searchParams.get("visitId");

    let visit = null;
    if (visitId) {
      visit = await db.getVisitById(visitId);
    } else {
      // Default to the most recent visit
      const visits = await db.getVisits();
      visit = visits[0];
    }

    if (!visit) {
      return NextResponse.json({ error: "Visit record not found" }, { status: 404 });
    }

    const pdfBytes = await generatePatientReportPdf(visit);

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="QueueLess-Medical-Report-${visit.visitNumber}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate PDF report" }, { status: 500 });
  }
}
