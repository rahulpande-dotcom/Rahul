import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  generatePatientReportPdf,
  generateItemizedBillPdf,
  generatePrescriptionPdf,
  generateProcedureReportPdf,
  generateDischargeSummaryPdf,
  generateMedicalHistoryPdf,
  generateHospitalOperationsReportPdf,
} from "@/lib/pdf-generator";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "encounter").toLowerCase();
    const visitId = searchParams.get("visitId");
    const billId = searchParams.get("billId");
    const procedureId = searchParams.get("procedureId");
    const patientId = searchParams.get("patientId");

    let pdfBytes: Uint8Array;
    let filename = "QueueLess-Medical-Document.pdf";

    if (type === "bill") {
      let bill = null;
      if (billId) {
        bill = await db.getBillById(billId);
      } else {
        const bills = await db.getBills();
        bill = bills[0] || null;
      }
      if (!bill) {
        return NextResponse.json({ error: "Medical bill record not found" }, { status: 404 });
      }
      pdfBytes = await generateItemizedBillPdf(bill);
      filename = `QueueLess-Bill-${bill.billNumber}.pdf`;
    } else if (type === "prescription") {
      let visit = null;
      if (visitId) {
        visit = await db.getVisitById(visitId);
      } else {
        const visits = await db.getVisits();
        visit = visits[0] || null;
      }
      if (!visit) {
        return NextResponse.json({ error: "Visit encounter not found" }, { status: 404 });
      }
      pdfBytes = await generatePrescriptionPdf(visit);
      filename = `QueueLess-Rx-Prescription-${visit.visitNumber}.pdf`;
    } else if (type === "procedure") {
      let proc = null;
      if (procedureId) {
        proc = await db.getProcedureById(procedureId);
      } else {
        const procs = await db.getProcedures();
        proc = procs[0] || null;
      }
      if (!proc) {
        return NextResponse.json({ error: "Procedure record not found" }, { status: 404 });
      }
      pdfBytes = await generateProcedureReportPdf(proc);
      filename = `QueueLess-Operation-Report-${proc.procedureNumber}.pdf`;
    } else if (type === "discharge") {
      let visit = null;
      if (visitId) {
        visit = await db.getVisitById(visitId);
      } else {
        const visits = await db.getVisits();
        visit = visits[0] || null;
      }
      if (!visit) {
        return NextResponse.json({ error: "Visit encounter not found" }, { status: 404 });
      }
      pdfBytes = await generateDischargeSummaryPdf(visit);
      filename = `QueueLess-Discharge-Summary-${visit.visitNumber}.pdf`;
    } else if (type === "history") {
      let patient = null;
      if (patientId) {
        patient = await db.getProfileById(patientId);
      } else {
        const profiles = await db.getProfiles();
        patient = profiles.find((p) => p.role === "patient") || profiles[0] || null;
      }
      if (!patient) {
        return NextResponse.json({ error: "Patient profile not found" }, { status: 404 });
      }
      const allVisits = await db.getVisits();
      const patientVisits = allVisits.filter((v) => v.patientId === patient.id || v.uhid === patient.uhid);
      pdfBytes = await generateMedicalHistoryPdf(patient, patientVisits);
      filename = `QueueLess-Medical-History-${patient.uhid || "Extract"}.pdf`;
    } else if (type === "operations") {
      const stats = await db.getDashboardStats();
      pdfBytes = await generateHospitalOperationsReportPdf(stats);
      filename = `QueueLess-Hospital-Operations-${new Date().toISOString().split("T")[0]}.pdf`;
    } else {
      // Default: Clinical Encounter Report
      let visit = null;
      if (visitId) {
        visit = await db.getVisitById(visitId);
      } else {
        const visits = await db.getVisits();
        visit = visits[0] || null;
      }
      if (!visit) {
        return NextResponse.json({ error: "Visit record not found" }, { status: 404 });
      }
      pdfBytes = await generatePatientReportPdf(visit);
      filename = `QueueLess-Medical-Report-${visit.visitNumber}.pdf`;
    }

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("PDF generation route error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate PDF document" }, { status: 500 });
  }
}
