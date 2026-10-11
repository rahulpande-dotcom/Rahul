import { describe, it, expect } from "vitest";
import { db } from "../src/lib/db";

describe("Multi-Hospital Network & Doctor Capacity Management", () => {
  it("loads 10 verified hospitals across Bengaluru Urban and Tumakuru", async () => {
    const hospitals = await db.getHospitals();
    expect(hospitals.length).toBeGreaterThanOrEqual(10);

    const blrHospitals = hospitals.filter(
      (h) => h.district === "Bengaluru Urban" || h.city === "Bengaluru"
    );
    const tmkHospitals = hospitals.filter(
      (h) => h.district === "Tumakuru" || h.city === "Tumakuru"
    );

    expect(blrHospitals.length).toBeGreaterThanOrEqual(5);
    expect(tmkHospitals.length).toBeGreaterThanOrEqual(3);

    // Verify all have emergency phone and ambulance numbers
    for (const h of hospitals) {
      expect(h.name).toBeTruthy();
      expect(h.emergencyHotline).toBeTruthy();
      expect(h.contactPhone).toBeTruthy();
    }
  });

  it("loads at least 20 hospital departments with standard INR fees between ₹1000 and ₹3000", async () => {
    const departments = await db.getDepartments();
    expect(departments.length).toBeGreaterThanOrEqual(20);

    const requiredDepts = [
      "General Medicine",
      "Gynecology and Obstetrics",
      "Dermatology / Skin Care",
      "Hair and Scalp Care (Trichology)",
      "Pediatrics",
      "Orthopedics",
      "Cardiology",
      "Neurology",
      "ENT (Ear, Nose & Throat)",
      "Ophthalmology",
      "Dentistry",
      "Psychiatry",
      "Urology",
      "Gastroenterology",
      "Pulmonology",
      "Endocrinology / Diabetes",
      "Physiotherapy & Rehabilitation",
      "General Surgery",
      "Oncology",
      "Emergency and Trauma Care",
    ];

    for (const deptName of requiredDepts) {
      const found = departments.find((d) => d.name === deptName);
      expect(found, `Department ${deptName} should exist`).toBeDefined();
      if (found?.standardFee) {
        expect(found.standardFee).toBeGreaterThanOrEqual(1000);
        expect(found.standardFee).toBeLessThanOrEqual(3000);
      }
    }
  });

  it("loads at least 4 doctor records per department in primary hospital (80 total)", async () => {
    const doctors = await db.getDoctors();
    expect(doctors.length).toBeGreaterThanOrEqual(80);

    const departments = await db.getDepartments();
    for (const dept of departments) {
      const deptDoctors = doctors.filter((d) => d.departmentName === dept.name);
      expect(
        deptDoctors.length,
        `Department ${dept.name} must have at least 4 doctors`
      ).toBeGreaterThanOrEqual(4);
    }
  });

  it("enforces normalized, case-insensitive doctor display name uniqueness within a hospital", async () => {
    const existingDoctors = await db.getDoctors();
    const firstDoctor = existingDoctors[0];

    // Attempt to create a doctor with duplicate name in same hospital (different casing and trailing spaces)
    const duplicateName = `  ${firstDoctor.name.toLowerCase()}  `;

    await expect(
      db.createDoctor({
        name: duplicateName,
        departmentId: firstDoctor.departmentId,
        departmentName: firstDoctor.departmentName,
        specialization: "Duplicate Test",
        roomNumber: "Room 999",
        consultationFee: 1500,
        availableDays: ["Monday"],
        isAvailableToday: true,
        hospitalId: firstDoctor.hospitalId,
      })
    ).rejects.toThrow(/already exists in this hospital/i);
  });

  it("prevents double-booking for the same doctor, date, and time slot", async () => {
    const doctors = await db.getDoctors();
    const doctor = doctors[0];
    const testDate = "2026-11-20";
    const testSlot = "10:00 AM";

    // First booking should succeed
    const firstBooking = await db.createAppointment({
      patientId: "usr-patient",
      patientName: "Rahul Sharma",
      patientPhone: "+91 98765 43210",
      patientEmail: "patient@queueless.ai",
      doctorId: doctor.id,
      doctorName: doctor.name,
      departmentId: doctor.departmentId,
      departmentName: doctor.departmentName,
      date: testDate,
      timeSlot: testSlot,
      reason: "Initial consultation",
      hospitalId: doctor.hospitalId,
    });

    expect(firstBooking.id).toBeTruthy();

    // Second booking with same doctor, date, slot must be rejected
    await expect(
      db.createAppointment({
        patientId: "usr-patient-2",
        patientName: "Second Patient",
        patientPhone: "+91 98765 00000",
        patientEmail: "second@queueless.ai",
        doctorId: doctor.id,
        doctorName: doctor.name,
        departmentId: doctor.departmentId,
        departmentName: doctor.departmentName,
        date: testDate,
        timeSlot: testSlot,
        reason: "Conflicting slot test",
        hospitalId: doctor.hospitalId,
      })
    ).rejects.toThrow(/already booked/i);
  });
});
