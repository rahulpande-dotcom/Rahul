import { describe, it, expect } from "vitest";
import {
  generatePatientReportPdf,
  generateItemizedBillPdf,
  generatePrescriptionPdf,
  generateProcedureReportPdf,
  generateDischargeSummaryPdf,
  generateMedicalHistoryPdf,
  generateHospitalOperationsReportPdf,
} from "../src/lib/pdf-generator";
import { ClinicalVisit, Bill, ProcedureRecord } from "../src/lib/types";

describe("Official Hospital Medical Reports (7 PDF Generators)", () => {
  const sampleVisit: ClinicalVisit = {
    id: "vst-test-01",
    visitNumber: "VST-2026-9999",
    tokenId: "tok-test-01",
    tokenNumber: "MED-01",
    patientId: "usr-patient",
    patientName: "Rahul Sharma",
    patientAge: 32,
    patientGender: "male",
    uhid: "QL-2026-8819",
    doctorId: "doc-1",
    doctorName: "Dr. Priya Sharma",
    departmentName: "General Medicine",
    roomNumber: "Room 101",
    visitDate: "2026-10-12",
    checkInTimestamp: new Date().toISOString(),
    consultationTimestamp: new Date().toISOString(),
    checkoutTimestamp: new Date().toISOString(),
    symptoms: "Fever, body ache, mild productive cough",
    diagnosis: "Acute Bronchitis (ICD-10 J20.9)",
    vitals: {
      bloodPressure: "120/80 mmHg",
      pulseRate: 74,
      temperature: 99.2,
      spO2: 98,
      weightKg: 68,
    },
    prescriptions: [
      {
        id: "rx-1",
        medicineName: "Amoxicillin-Clavulanate 625mg",
        dosage: "1 Tab",
        frequency: "1-0-1",
        duration: "5 Days",
        instructions: "After food",
      },
      {
        id: "rx-2",
        medicineName: "Paracetamol 650mg",
        dosage: "1 Tab",
        frequency: "SOS",
        duration: "3 Days",
        instructions: "If fever > 100°F",
      },
    ],
    doctorAdvice: "Hydration, warm saline gargle, steam inhalation",
    followUpDate: "2026-10-19",
    billingStatus: "PAID",
    billingAmount: 1500,
    status: "COMPLETED",
    createdAt: new Date().toISOString(),
  };

  const sampleBill: Bill = {
    id: "bill-test-01",
    billNumber: "INV-2026-9999",
    patientId: "usr-patient",
    patientName: "Rahul Sharma",
    uhid: "QL-2026-8819",
    hospitalId: "hosp-queueless-blr",
    hospitalName: "QueueLess AI Smart Hospital",
    hospitalAddress: "450 9th Main Road, Jayanagar 4th Block, Bengaluru, Karnataka 560011",
    departmentName: "General Medicine",
    attendingDoctorName: "Dr. Priya Sharma, MD",
    billDate: "2026-10-12",
    items: [
      {
        id: "bi-1",
        billId: "bill-test-01",
        category: "CONSULTATION",
        itemDescription: "General Medicine OPD Consultation",
        quantity: 1,
        unitPrice: 1500,
        totalPrice: 1500,
      },
      {
        id: "bi-2",
        billId: "bill-test-01",
        category: "DIAGNOSTIC_LAB",
        itemDescription: "Complete Hemogram (CBC)",
        quantity: 1,
        unitPrice: 500,
        totalPrice: 500,
      },
    ],
    subtotal: 2000,
    discountAmount: 200,
    taxAmount: 0,
    totalPayable: 1800,
    totalAmount: 1800,
    amountPaid: 1800,
    balanceDue: 0,
    currency: "INR",
    paymentStatus: "PAID",
    isImmutable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sampleProcedure: ProcedureRecord = {
    id: "prc-test-01",
    procedureNumber: "PRC-2026-9999",
    procedureName: "Diagnostic Knee Arthroscopy & Synovial Biopsy",
    procedureCode: "CPT-29870",
    patientId: "usr-patient",
    patientName: "Rahul Sharma",
    uhid: "QL-2026-8819",
    leadSurgeonName: "Dr. Vikram Seth, MS (Ortho)",
    departmentName: "Orthopedics",
    procedureDate: "2026-10-12",
    startTime: "09:30 AM",
    endTime: "10:45 AM",
    operatingRoom: "OT 3",
    anesthesiaType: "Spinal Anesthesia",
    anesthesiologistName: "Dr. Arvind Rao, MD (Anesth)",
    indication: "Persistent joint effusion, mechanical catching of left knee",
    preoperativeAssessment: "ASA Grade I, informed surgical consent documented",
    consentObtained: true,
    operativeFindings: "Satisfactory lateral meniscus inspection. Grade I articular wear.",
    procedureNotes: "Standard arthroscopic portals created. Synovial biopsy collected. Pressure dressing applied.",
    complications: "None observed. Minimal intra-articular blood loss (< 20 ml).",
    postoperativeCondition: "Stable, vitals within normal parameters",
    postoperativePlan: "Cryotherapy, crutch weight-bearing, analgesia",
    isVerified: true,
    verifiedByDoctorName: "Dr. Vikram Seth, MS (Ortho)",
    verifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  function assertValidPdf(pdfBytes: Uint8Array) {
    expect(pdfBytes).toBeDefined();
    expect(pdfBytes.length).toBeGreaterThan(100);
    // PDF magic bytes: %PDF (0x25, 0x50, 0x44, 0x46)
    const header = String.fromCharCode(...pdfBytes.slice(0, 4));
    expect(header).toBe("%PDF");
  }

  it("1. generates Clinical Encounter Report PDF successfully", async () => {
    const pdfBytes = await generatePatientReportPdf(sampleVisit);
    assertValidPdf(pdfBytes);
  });

  it("2. generates Itemized Medical Bill PDF successfully", async () => {
    const pdfBytes = await generateItemizedBillPdf(sampleBill);
    assertValidPdf(pdfBytes);
  });

  it("3. generates Prescription Slip (Rx) PDF successfully", async () => {
    const pdfBytes = await generatePrescriptionPdf(sampleVisit);
    assertValidPdf(pdfBytes);
  });

  it("4. generates Surgical Procedure Report PDF successfully", async () => {
    const pdfBytes = await generateProcedureReportPdf(sampleProcedure);
    assertValidPdf(pdfBytes);
  });

  it("5. generates Official Discharge Summary PDF successfully", async () => {
    const pdfBytes = await generateDischargeSummaryPdf(sampleVisit);
    assertValidPdf(pdfBytes);
  });

  it("6. generates Longitudinal Medical History PDF successfully", async () => {
    const pdfBytes = await generateMedicalHistoryPdf(
      sampleVisit.patientName,
      sampleVisit.uhid,
      [sampleVisit]
    );
    assertValidPdf(pdfBytes);
  });

  it("7. generates Hospital Operations Executive Report PDF successfully", async () => {
    const stats = {
      totalWaiting: 12,
      totalActive: 4,
      totalCompletedToday: 48,
      avgWaitMinutes: 14,
      emergencyActiveCount: 2,
    };
    const departments = [
      { id: "d1", name: "General Medicine", code: "GEN", floor: "1st Floor", activeDoctorsCount: 4, avgConsultationMinutes: 12 },
      { id: "d2", name: "Cardiology", code: "CARD", floor: "3rd Floor", activeDoctorsCount: 4, avgConsultationMinutes: 15 },
    ];
    const pdfBytes = await generateHospitalOperationsReportPdf(stats, departments);
    assertValidPdf(pdfBytes);
  });
});
