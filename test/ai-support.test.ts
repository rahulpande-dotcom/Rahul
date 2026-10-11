import { describe, it, expect } from "vitest";
import { generateClinicalAssistance, AI_SAFETY_DISCLAIMER } from "../src/lib/ai-clinical-support";
import { db } from "../src/lib/db";

describe("AI Clinical Decision Support & Safety Boundaries", () => {
  it("includes mandatory safety disclaimer stating AI is assistive only", () => {
    expect(AI_SAFETY_DISCLAIMER).toContain("assistive tool for licensed healthcare professionals");
    expect(AI_SAFETY_DISCLAIMER).toContain("does not establish a medical diagnosis");
  });

  it("identifies critical red flags for acute coronary / cardiac symptoms", () => {
    const result = generateClinicalAssistance({
      patientId: "test-pat",
      doctorId: "test-doc",
      symptoms: "Severe acute chest pain radiating to left shoulder and jaw with cold sweats",
      vitals: { bloodPressure: "145/95", pulseRate: 104, spO2: 96, temperature: 98.4, weightKg: 78 },
    });

    expect(result.redFlags.length).toBeGreaterThan(0);
    expect(result.redFlags[0]).toContain("Acute Coronary Syndrome");
    expect(result.suggestedInvestigations).toContain("12-Lead Electrocardiogram (ECG)");
    expect(result.differentials.some((d) => d.likelihood === "HIGH")).toBe(true);
  });

  it("detects hypoxia / respiratory distress red flags when SpO2 < 94", () => {
    const result = generateClinicalAssistance({
      patientId: "test-pat",
      doctorId: "test-doc",
      symptoms: "Persistent shortness of breath and wheezing",
      vitals: { bloodPressure: "120/80", pulseRate: 98, spO2: 91, temperature: 99.0, weightKg: 65 },
    });

    expect(result.redFlags.length).toBeGreaterThan(0);
    expect(result.redFlags[0]).toContain("HYPOXIA");
    expect(result.suggestedInvestigations).toContain("Chest X-Ray (PA View)");
  });

  it("supports clinician review and approval workflow in the database", async () => {
    const suggestion = await db.createAiClinicalSuggestion({
      id: `ai-test-${Date.now()}`,
      patientId: "usr-patient",
      doctorId: "doc-1",
      differentials: [
        {
          condition: "Acute Viral Rhinitis (ICD-10 J00)",
          likelihood: "HIGH",
          clinicalRationale: "Low grade fever and nasal congestion",
        },
      ],
      redFlags: [],
      suggestedInvestigations: ["CBC"],
      clinicalQuestions: ["Duration of fever?"],
      disclaimer: AI_SAFETY_DISCLAIMER,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    });

    expect(suggestion.status).toBe("PENDING");

    const approved = await db.updateAiClinicalSuggestionStatus(
      suggestion.id,
      "APPROVED",
      "Physician reviewed and verified with clinical exam",
      "Dr. Priya Sharma"
    );

    expect(approved?.status).toBe("APPROVED");
    expect(approved?.approvedByDoctorName).toBe("Dr. Priya Sharma");
  });
});
