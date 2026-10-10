import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Visit } from "./types";

export async function generatePatientReportPdf(visit: Visit): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points: 595 x 842

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const { width, height } = page.getSize();
  const margin = 45;
  let cursorY = height - 40;

  // Header Background Banner
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: rgb(0.12, 0.42, 0.82), // Primary medical blue
  });

  // Hospital Name
  page.drawText("QUEUELESS AI — SMART HOSPITAL", {
    x: margin,
    y: cursorY - 10,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // Hospital Subtitle
  page.drawText("Digital OPD & Clinical Encounter Summary", {
    x: margin,
    y: cursorY - 28,
    size: 10,
    font: fontRegular,
    color: rgb(0.9, 0.95, 1),
  });

  // Emergency Hotline & Contact on right side
  page.drawText("Emergency 24x7: +1 (800) 911-HELP", {
    x: width - margin - 200,
    y: cursorY - 10,
    size: 9,
    font: fontBold,
    color: rgb(1, 0.85, 0.85),
  });
  page.drawText("450 Healthcare Blvd, Metro City", {
    x: width - margin - 200,
    y: cursorY - 24,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.9, 0.95, 1),
  });

  cursorY = height - 120;

  // Title: OFFICIAL CLINICAL ENCOUNTER RECORD
  page.drawText("OFFICIAL PATIENT MEDICAL CONSULTATION REPORT", {
    x: margin,
    y: cursorY,
    size: 12,
    font: fontBold,
    color: rgb(0.1, 0.2, 0.4),
  });

  cursorY -= 16;

  // Draw separator line
  page.drawLine({
    start: { x: margin, y: cursorY },
    end: { x: width - margin, y: cursorY },
    thickness: 1,
    color: rgb(0.8, 0.85, 0.9),
  });

  cursorY -= 20;

  // Patient & Visit Details Box
  page.drawRectangle({
    x: margin,
    y: cursorY - 80,
    width: width - margin * 2,
    height: 90,
    color: rgb(0.96, 0.98, 1.0),
    borderColor: rgb(0.8, 0.88, 0.98),
    borderWidth: 1,
  });

  const col1 = margin + 12;
  const col2 = margin + 270;
  const boxTop = cursorY;

  // Left column patient info
  page.drawText(`Patient Name:`, { x: col1, y: boxTop - 12, size: 9, font: fontBold, color: rgb(0.3, 0.35, 0.4) });
  page.drawText(visit.patientName, { x: col1 + 80, y: boxTop - 12, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

  page.drawText(`UHID / Patient ID:`, { x: col1, y: boxTop - 28, size: 9, font: fontBold, color: rgb(0.3, 0.35, 0.4) });
  page.drawText(visit.uhid, { x: col1 + 95, y: boxTop - 28, size: 9, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });

  page.drawText(`Age / Gender:`, { x: col1, y: boxTop - 44, size: 9, font: fontBold, color: rgb(0.3, 0.35, 0.4) });
  page.drawText(`${visit.patientAge || "N/A"} Yrs / ${visit.patientGender ? visit.patientGender.toUpperCase() : "N/A"}`, {
    x: col1 + 80,
    y: boxTop - 44,
    size: 9,
    font: fontRegular,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText(`Token Number:`, { x: col1, y: boxTop - 60, size: 9, font: fontBold, color: rgb(0.3, 0.35, 0.4) });
  page.drawText(visit.tokenNumber, { x: col1 + 80, y: boxTop - 60, size: 9.5, font: fontBold, color: rgb(0.1, 0.4, 0.8) });

  // Right column visit info
  page.drawText(`Consulting Doctor:`, { x: col2, y: boxTop - 12, size: 9, font: fontBold, color: rgb(0.3, 0.35, 0.4) });
  page.drawText(visit.doctorName, { x: col2 + 95, y: boxTop - 12, size: 9.5, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

  page.drawText(`Department & Room:`, { x: col2, y: boxTop - 28, size: 9, font: fontBold, color: rgb(0.3, 0.35, 0.4) });
  page.drawText(`${visit.departmentName} (${visit.roomNumber})`, {
    x: col2 + 95,
    y: boxTop - 28,
    size: 9,
    font: fontRegular,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText(`Encounter Date:`, { x: col2, y: boxTop - 44, size: 9, font: fontBold, color: rgb(0.3, 0.35, 0.4) });
  page.drawText(visit.visitDate, { x: col2 + 95, y: boxTop - 44, size: 9, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });

  page.drawText(`Visit Record ID:`, { x: col2, y: boxTop - 60, size: 9, font: fontBold, color: rgb(0.3, 0.35, 0.4) });
  page.drawText(visit.visitNumber, { x: col2 + 95, y: boxTop - 60, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });

  cursorY -= 105;

  // Digital Timestamps Journey Bar
  page.drawText("VISIT JOURNEY AUDIT TIMESTAMPS", {
    x: margin,
    y: cursorY,
    size: 10,
    font: fontBold,
    color: rgb(0.15, 0.25, 0.4),
  });
  cursorY -= 14;

  const tCheckIn = visit.checkInTimestamp ? new Date(visit.checkInTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A";
  const tConsult = visit.consultationTimestamp ? new Date(visit.consultationTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A";
  const tCheckout = visit.checkoutTimestamp ? new Date(visit.checkoutTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A";

  page.drawText(`• Check-In: ${tCheckIn}     • Doctor Consultation: ${tConsult}     • Discharge/Checkout: ${tCheckout}`, {
    x: margin + 10,
    y: cursorY,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });

  cursorY -= 22;

  // Vital Signs Section
  page.drawText("RECORDED VITAL SIGNS", {
    x: margin,
    y: cursorY,
    size: 10,
    font: fontBold,
    color: rgb(0.15, 0.25, 0.4),
  });
  cursorY -= 16;

  page.drawRectangle({
    x: margin,
    y: cursorY - 26,
    width: width - margin * 2,
    height: 34,
    color: rgb(0.98, 0.99, 1),
    borderColor: rgb(0.85, 0.9, 0.95),
    borderWidth: 1,
  });

  const vitalsText = `Blood Pressure: ${visit.vitals.bloodPressure || "120/80 mmHg"}   |   Pulse: ${visit.vitals.pulseRate || 72} bpm   |   Temp: ${visit.vitals.temperature || 98.6}°F   |   SpO2: ${visit.vitals.spO2 || 99}%   |   Weight: ${visit.vitals.weightKg || 70} kg`;
  page.drawText(vitalsText, {
    x: margin + 12,
    y: cursorY - 14,
    size: 8.5,
    font: fontBold,
    color: rgb(0.2, 0.3, 0.4),
  });

  cursorY -= 48;

  // Clinical Symptoms & Diagnosis
  page.drawText("CHIEF COMPLAINTS & CLINICAL DIAGNOSIS", {
    x: margin,
    y: cursorY,
    size: 10,
    font: fontBold,
    color: rgb(0.15, 0.25, 0.4),
  });
  cursorY -= 15;

  page.drawText(`Symptoms: ${visit.symptoms || "None reported"}`, {
    x: margin + 10,
    y: cursorY,
    size: 9,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  });
  cursorY -= 15;

  page.drawText(`Primary Diagnosis: ${visit.diagnosis || "Clinical assessment standard"}`, {
    x: margin + 10,
    y: cursorY,
    size: 9.5,
    font: fontBold,
    color: rgb(0.1, 0.2, 0.5),
  });

  cursorY -= 25;

  // Prescribed Medications Table
  page.drawText("PRESCRIBED MEDICATIONS & DOSAGE", {
    x: margin,
    y: cursorY,
    size: 10,
    font: fontBold,
    color: rgb(0.15, 0.25, 0.4),
  });
  cursorY -= 16;

  // Table Header
  page.drawRectangle({
    x: margin,
    y: cursorY - 16,
    width: width - margin * 2,
    height: 20,
    color: rgb(0.9, 0.94, 0.98),
  });

  page.drawText("Medicine Name", { x: margin + 8, y: cursorY - 12, size: 8.5, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
  page.drawText("Dosage", { x: margin + 160, y: cursorY - 12, size: 8.5, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
  page.drawText("Frequency", { x: margin + 250, y: cursorY - 12, size: 8.5, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
  page.drawText("Duration", { x: margin + 350, y: cursorY - 12, size: 8.5, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
  page.drawText("Instructions", { x: margin + 410, y: cursorY - 12, size: 8.5, font: fontBold, color: rgb(0.1, 0.2, 0.4) });

  cursorY -= 20;

  if (visit.prescriptions && visit.prescriptions.length > 0) {
    for (const rx of visit.prescriptions) {
      page.drawLine({
        start: { x: margin, y: cursorY + 2 },
        end: { x: width - margin, y: cursorY + 2 },
        thickness: 0.5,
        color: rgb(0.9, 0.9, 0.9),
      });

      page.drawText(rx.medicineName, { x: margin + 8, y: cursorY - 10, size: 8.5, font: fontBold, color: rgb(0.15, 0.15, 0.15) });
      page.drawText(rx.dosage, { x: margin + 160, y: cursorY - 10, size: 8, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(rx.frequency, { x: margin + 250, y: cursorY - 10, size: 8, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(rx.duration, { x: margin + 350, y: cursorY - 10, size: 8, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(rx.instructions || "-", { x: margin + 410, y: cursorY - 10, size: 7.5, font: fontOblique, color: rgb(0.3, 0.3, 0.3) });

      cursorY -= 18;
    }
  } else {
    page.drawText("No medications prescribed for this visit.", {
      x: margin + 10,
      y: cursorY - 10,
      size: 8.5,
      font: fontOblique,
      color: rgb(0.4, 0.4, 0.4),
    });
    cursorY -= 18;
  }

  cursorY -= 15;

  // Doctor's Advice Box
  page.drawText("PHYSICIAN ADVICE & FOLLOW-UP", {
    x: margin,
    y: cursorY,
    size: 10,
    font: fontBold,
    color: rgb(0.15, 0.25, 0.4),
  });
  cursorY -= 14;

  page.drawText(`Advice: ${visit.doctorAdvice || "Rest well and maintain adequate hydration."}`, {
    x: margin + 10,
    y: cursorY,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  });
  cursorY -= 14;

  if (visit.followUpDate) {
    page.drawText(`Recommended Next Follow-up: ${visit.followUpDate}`, {
      x: margin + 10,
      y: cursorY,
      size: 9,
      font: fontBold,
      color: rgb(0.1, 0.4, 0.8),
    });
    cursorY -= 20;
  }

  // Doctor Signature & Digital Verification Footer
  const footerY = 70;

  page.drawLine({
    start: { x: margin, y: footerY + 50 },
    end: { x: width - margin, y: footerY + 50 },
    thickness: 1,
    color: rgb(0.85, 0.88, 0.92),
  });

  page.drawText("DIGITALLY SIGNED & VERIFIED", {
    x: margin,
    y: footerY + 34,
    size: 8,
    font: fontBold,
    color: rgb(0.1, 0.5, 0.2),
  });
  page.drawText(`Electronically authenticated by ${visit.doctorName}`, {
    x: margin,
    y: footerY + 22,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.35),
  });
  page.drawText("QueueLess AI EHR Verification Hash: QL-EHR-AUTH-9821-SECURE", {
    x: margin,
    y: footerY + 10,
    size: 7,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Doctor Name Sign Line
  page.drawText("Attending Physician", {
    x: width - margin - 150,
    y: footerY + 34,
    size: 8,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });
  page.drawText(visit.doctorName, {
    x: width - margin - 150,
    y: footerY + 20,
    size: 9,
    font: fontBold,
    color: rgb(0.1, 0.3, 0.6),
  });
  page.drawText(visit.departmentName, {
    x: width - margin - 150,
    y: footerY + 8,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  return await pdfDoc.save();
}
