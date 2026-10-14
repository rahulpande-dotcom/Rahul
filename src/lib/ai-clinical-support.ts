import { AiClinicalSuggestion, AiDifferentialDiagnosis, VitalSigns } from "./types";

export const AI_SAFETY_DISCLAIMER =
  "AI Clinical Decision Support is an assistive tool for licensed healthcare professionals only. It does not establish a medical diagnosis, prescribe medication, or override clinical judgment. All suggestions require independent physician review and confirmation.";

interface ClinicalAnalysisInput {
  patientId: string;
  doctorId: string;
  symptoms: string;
  vitals?: VitalSigns;
  knownAllergies?: string;
  currentMedications?: string[];
  visitId?: string;
}

export interface ClinicalAssistanceResult {
  visitId?: string;
  patientId: string;
  doctorId: string;
  symptomsReported: string;
  organizedSummary: string;
  differentialDiagnoses: AiDifferentialDiagnosis[];
  differentials: AiDifferentialDiagnosis[];
  redFlagsDetected: string[];
  redFlags: string[];
  suggestedInvestigations: string[];
  suggestedClinicalQuestions: string[];
  clinicalQuestions: string[];
  medicationSafetyChecks: string[];
  disclaimer: string;
  status:
    | "SUGGESTION_PENDING_REVIEW"
    | "CLINICIAN_APPROVED"
    | "CLINICIAN_EDITED"
    | "DISMISSED"
    | "PENDING"
    | "APPROVED";
}

export function generateClinicalAssistance(input: ClinicalAnalysisInput): ClinicalAssistanceResult {
  const s = input.symptoms.toLowerCase();
  const differentials: AiDifferentialDiagnosis[] = [];
  const redFlags: string[] = [];
  const investigations: string[] = [];
  const questions: string[] = [];
  const medicationChecks: string[] = [];

  // Red Flags Detection
  if (s.includes("chest pain") || s.includes("angina") || s.includes("pressure in chest")) {
    redFlags.push("CRITICAL: Acute Coronary Syndrome (ACS) / Myocardial Ischemia risk. Immediate 12-lead ECG and Troponin I recommended.");
    differentials.push({
      condition: "Acute Coronary Syndrome / Angina Pectoris",
      likelihood: "HIGH",
      clinicalRationale: "Patient complaints include acute or radiating chest discomfort. Prompt cardiac enzyme evaluation warranted.",
    });
    differentials.push({
      condition: "Gastroesophageal Reflux Disease (GERD) with esophageal spasm",
      likelihood: "MODERATE",
      clinicalRationale: "Non-cardiac chest discomfort often mimics retrosternal pressure; requires exclusion of cardiac origin first.",
    });
    investigations.push("12-Lead Electrocardiogram (ECG)");
    investigations.push("Serum Troponin I / CK-MB");
    investigations.push("Echocardiography (2D Echo)");
    questions.push("Does the chest pain radiate to the left arm, neck, or jaw?");
    questions.push("Is the pain exacerbated by exertion or relieved by rest?");
  }

  if (s.includes("shortness of breath") || s.includes("breathlessness") || s.includes("dyspnea") || (input.vitals?.spO2 && input.vitals.spO2 < 94)) {
    redFlags.push("HYPOXIA / RESPIRATORY DISTRESS: SpO2 or respiratory rate indicates compromised oxygenation.");
    differentials.push({
      condition: "Acute Bronchospasm / Asthma Exacerbation",
      likelihood: "HIGH",
      clinicalRationale: "Episodic dyspnea with wheeze or cough indicates airway hyperresponsiveness.",
    });
    differentials.push({
      condition: "Lower Respiratory Tract Infection / Community-Acquired Pneumonia",
      likelihood: "MODERATE",
      clinicalRationale: "Fever and dyspnea suggest consolidation or alveolar infiltration.",
    });
    investigations.push("Chest X-Ray (PA View)");
    investigations.push("Arterial Blood Gas (ABG)");
    investigations.push("Complete Blood Count with Absolute Neutrophil Count");
    questions.push("Is there productive cough, hemoptysis, or nocturnal orthopnea?");
  }

  if (s.includes("headache") || s.includes("migraine") || s.includes("fever")) {
    if (s.includes("stiff neck") || s.includes("neck stiffness") || s.includes("photophobia")) {
      redFlags.push("MENINGEAL SIGNS: Combination of fever, severe headache, and neck stiffness. Exclude acute bacterial meningitis.");
    }
    differentials.push({
      condition: "Acute Viral Rhinitis / Upper Respiratory Infection (ICD-10 J00)",
      likelihood: "HIGH",
      clinicalRationale: "Constitutional symptoms of mild pyrexia, rhinitis, and generalized cephalea in seasonal change.",
    });
    differentials.push({
      condition: "Tension-Type Headache vs Migraine without Aura (ICD-10 G43.9)",
      likelihood: "MODERATE",
      clinicalRationale: "Recurrent fronto-temporal or occipital headache triggered by physical or occupational strain.",
    });
    investigations.push("Complete Blood Count (CBC) with ESR & CRP");
    investigations.push("Dengue NS1 Antigen & IgM (if fever > 3 days in endemic region)");
    questions.push("How many days has the fever persisted, and does it peak at specific times?");
    questions.push("Are there associated visual auras, nausea, or phonophobia?");
  }

  if (s.includes("knee") || s.includes("joint") || s.includes("back pain") || s.includes("swelling")) {
    differentials.push({
      condition: "Traumatic / Inflammatory Synovitis or Ligamentous Sprain",
      likelihood: "HIGH",
      clinicalRationale: "Localized joint effusion with movement restriction following mechanical strain.",
    });
    differentials.push({
      condition: "Early Osteoarthritis with Secondary Synovitis",
      likelihood: "MODERATE",
      clinicalRationale: "Persistent stiffness and weight-bearing pain in weight-bearing joints.",
    });
    investigations.push("Digital High-Resolution X-Ray Joint (AP & Lateral)");
    investigations.push("Serum Uric Acid & ESR");
    questions.push("Did the pain follow an acute twist, pop, or fall during activity?");
    questions.push("Is there morning stiffness lasting greater than 30 minutes?");
  }

  // Fallback defaults if symptoms are general
  if (differentials.length === 0) {
    differentials.push({
      condition: "Acute Symptomatic Evaluation Needed",
      likelihood: "MODERATE",
      clinicalRationale: "Non-specific presentation requires systemic physical examination and baseline lab panel.",
    });
    investigations.push("Complete Blood Count (CBC)");
    investigations.push("Random Blood Sugar (RBS)");
    questions.push("When did the primary symptom begin, and what makes it better or worse?");
  }

  // Allergy & Medication Safety Checks
  if (input.knownAllergies && input.knownAllergies.toLowerCase().includes("penicillin")) {
    medicationChecks.push("ALLERGY ALERT: Known Penicillin allergy. Avoid Amoxicillin, Ampicillin, and verify Cephalosporin cross-reactivity.");
  }
  if (input.knownAllergies && input.knownAllergies.toLowerCase().includes("sulfa")) {
    medicationChecks.push("ALLERGY ALERT: Sulfa allergy documented. Avoid Co-Trimoxazole and sulfonamide diuretics.");
  }

  const summary = `Patient reports: "${input.symptoms}". Clinical focus highlights ${differentials.length} differential considerations with ${redFlags.length} immediate triage attention markers.`;

  return {
    visitId: input.visitId,
    patientId: input.patientId,
    doctorId: input.doctorId,
    symptomsReported: input.symptoms,
    organizedSummary: summary,
    differentialDiagnoses: differentials,
    differentials,
    redFlagsDetected: redFlags,
    redFlags,
    suggestedInvestigations: investigations,
    suggestedClinicalQuestions: questions,
    clinicalQuestions: questions,
    medicationSafetyChecks: medicationChecks,
    disclaimer: AI_SAFETY_DISCLAIMER,
    status: "SUGGESTION_PENDING_REVIEW",
  } as any;
}
