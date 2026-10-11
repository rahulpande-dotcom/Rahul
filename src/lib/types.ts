export type UserRole = "admin" | "staff" | "doctor" | "patient";

export type TokenStatus =
  | "WAITING"
  | "CHECKED_IN"
  | "CALLED"
  | "IN_CONSULTATION"
  | "COMPLETED"
  | "CHECKED_OUT"
  | "CANCELLED"
  | "NO_SHOW";

export type TokenPriority = "NORMAL" | "SENIOR_CITIZEN" | "EMERGENCY";

export type TriageSeverity = "LEVEL_1_RESUSCITATION" | "LEVEL_2_EMERGENT" | "LEVEL_3_URGENT";

// Hospital Entity (Multi-Hospital Directory across Tumakuru & Bengaluru)
export interface Hospital {
  id: string;
  name: string;
  code: string; // e.g. QL-BLR-01, TMK-DIST-01
  tagline: string;
  district: string; // e.g. "Bengaluru Urban", "Tumakuru"
  city: string; // e.g. "Bengaluru", "Tumakuru"
  locality: string; // e.g. "Jayanagar", "B.H. Road", "Malleshwaram"
  address: string;
  contactPhone: string;
  emergencyHotline: string;
  website?: string;
  email?: string;
  isPrimary?: boolean;
  verificationStatus: "VERIFIED" | "PENDING_VERIFICATION";
  verificationSource?: string;
  activeDepartmentsCount?: number;
  totalDoctorsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  hospitalId?: string;
  phone?: string;
  age?: number;
  gender?: "male" | "female" | "other";
  bloodGroup?: string;
  emergencyContact?: string;
  uhid?: string; // Unique Health ID: e.g. QL-2026-8819
  address?: string;
  password?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  hospitalId?: string;
  name: string;
  code: string; // GEN, GYN, DER, TRI, PED, ORT, CAR, NEU, ENT, OPH, DEN, PSY, URO, GAS, PUL, END, PHY, SUR, ONC, EMG
  floor: string;
  description: string;
  avgConsultationMinutes: number;
  activeDoctorsCount: number;
  iconName?: string;
  imageUrl?: string;
  roomNumbers?: string[];
  standardFee?: number; // Configurable between ₹1,000 and ₹3,000
  headDoctorName?: string;
  active?: boolean;
}

export interface Doctor {
  id: string;
  hospitalId?: string;
  name: string; // Unique within hospital, normalized case-insensitive
  departmentId: string;
  departmentName: string;
  specialization: string;
  qualifications?: string; // e.g. "MBBS, MD (General Medicine)", "MBBS, MS (Orthopedics)"
  experienceYears?: number;
  roomNumber: string;
  consultationFee: number; // In INR (₹1,000 - ₹3,000)
  availableDays: string[];
  isAvailableToday: boolean;
  appointmentCapacityPerDay?: number; // Maximum slots per doctor per day
  status?: "ACTIVE" | "INACTIVE";
  isDemo?: boolean; // Labeled as demonstration data
  avatarUrl?: string;
  currentQueueCount?: number;
}

export interface Appointment {
  id: string;
  hospitalId?: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  departmentId: string;
  departmentName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
  reason: string;
  consultationFee?: number; // in INR ₹
  status: "CONFIRMED" | "CHECKED_IN" | "COMPLETED" | "CANCELLED";
  tokenId?: string;
  createdAt: string;
}

export interface Token {
  id: string;
  hospitalId?: string;
  tokenNumber: string; // e.g. OPD-GEN-101, EMG-001
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  doctorId?: string;
  doctorName?: string;
  roomNumber?: string;
  patientId?: string; // Optional for walk-in or emergency
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone?: string;
  isEmergency: boolean;
  priority: TokenPriority;
  status: TokenStatus;
  type: "ONLINE" | "WALK_IN" | "EMERGENCY";
  queuePosition: number;
  estimatedWaitMinutes: number;
  symptoms?: string;
  isDemo?: boolean;
  generatedAt: string;
  checkInAt?: string;
  calledAt?: string;
  consultationStartAt?: string;
  completedAt?: string;
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  dosage: string; // e.g. "500mg"
  route?: string; // e.g. "Oral", "Topical", "IV", "Inhalation"
  frequency: string; // e.g. "1-0-1 (After Meals)"
  duration: string; // e.g. "5 Days"
  instructions: string; // e.g. "Take with plenty of warm water"
}

export interface VitalSigns {
  bloodPressure?: string; // e.g. "120/80 mmHg"
  pulseRate?: number; // bpm
  temperature?: number; // °F
  spO2?: number; // %
  weightKg?: number; // kg
  bloodGlucose?: number; // mg/dL
  measuredAt?: string;
}

export interface Visit {
  id: string;
  hospitalId?: string;
  visitNumber: string; // e.g. VST-2026-1042
  tokenId: string;
  tokenNumber: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  uhid: string;
  doctorId: string;
  doctorName: string;
  departmentName: string;
  roomNumber: string;
  visitDate: string;
  checkInTimestamp: string;
  consultationTimestamp?: string;
  checkoutTimestamp?: string;
  symptoms: string;
  diagnosis: string;
  diagnosisCode?: string; // e.g. "ICD-10 J00"
  allergies?: string;
  investigationResults?: string;
  vitals: VitalSigns;
  prescriptions: PrescriptionItem[];
  doctorAdvice: string;
  followUpDate?: string;
  billingStatus: "PAID" | "PENDING" | "WAIVED";
  billingAmount: number; // In INR (₹)
  billId?: string;
  procedureId?: string;
  status: "IN_PROGRESS" | "COMPLETED";
}

// -----------------------------------------------------------------------------
// Comprehensive Itemized Billing System (in INR ₹)
// -----------------------------------------------------------------------------
export type BillingItemCategory =
  | "CONSULTATION"
  | "SPECIALIST_CONSULTATION"
  | "DIAGNOSTIC_LAB"
  | "IMAGING"
  | "PHARMACY_MEDICINE"
  | "PROCEDURE"
  | "SURGERY_OPERATION"
  | "ANESTHESIA"
  | "BED_NURSING"
  | "CONSUMABLES"
  | "OTHER";

export interface BillItem {
  id: string;
  billId: string;
  category: BillingItemCategory;
  itemDescription: string;
  description?: string; // alias for itemDescription
  itemCode?: string;
  quantity: number;
  unitPrice: number; // in INR (₹)
  totalPrice: number; // quantity * unitPrice
}

export interface Bill {
  id: string;
  billNumber: string; // e.g. "INV-2026-0012"
  hospitalId?: string;
  hospitalName: string;
  hospitalAddress: string;
  patientId: string;
  patientName: string;
  uhid: string;
  visitId?: string;
  visitNumber?: string;
  tokenId?: string;
  tokenNumber?: string;
  departmentName: string;
  attendingDoctorName: string;
  billDate: string;
  items: BillItem[];
  subtotal: number; // in INR ₹
  discountAmount: number; // in INR ₹
  discountReason?: string;
  authorizedBy?: string; // admin or staff email
  taxAmount: number; // in INR ₹
  totalPayable: number; // subtotal - discountAmount + taxAmount
  totalAmount?: number; // alias for totalPayable
  amountPaid: number; // in INR ₹
  balanceDue: number; // totalPayable - amountPaid
  currency?: string; // standard "INR"
  paymentStatus: "PAID" | "PARTIAL" | "PENDING" | "REFUNDED";
  status?: string; // alias for paymentStatus
  paymentMethod?: "CASH" | "UPI" | "CARD" | "INSURANCE" | "NET_BANKING";
  paymentReference?: string;
  paidAt?: string;
  isImmutable: boolean;
  adjustmentNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Surgical & Medical Procedure Records
// -----------------------------------------------------------------------------
export interface ProcedureRecord {
  id: string;
  procedureNumber: string; // e.g. "PRC-2026-104"
  hospitalId?: string;
  patientId: string;
  patientName: string;
  uhid: string;
  visitId?: string;
  procedureName: string;
  procedureCode?: string; // e.g. "CPT-43235"
  indication: string;
  preoperativeAssessment: string;
  consentObtained: boolean;
  consentDocumentRef?: string;
  leadSurgeonName: string;
  surgeonId?: string;
  surgicalTeam: string[];
  departmentName: string;
  operatingRoom: string;
  procedureDate: string;
  startTime: string;
  endTime: string;
  anesthesiaType: "LOCAL" | "GENERAL" | "SPINAL" | "SEDATION" | "NONE";
  anesthesiologistName?: string;
  operativeFindings: string;
  procedureNotes: string;
  complications: string;
  postoperativeCondition: string;
  carePlan: string;
  followUpInstructions: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "VERIFIED" | "CANCELLED";
  isVerified: boolean;
  verifiedByDoctorId?: string;
  verifiedByDoctorName?: string;
  verifiedAt?: string;
  relatedBillId?: string;
  procedureFee: number; // in INR ₹
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// AI-Assisted Clinical Support (Clinician-in-the-Loop)
// -----------------------------------------------------------------------------
export interface AiDifferentialDiagnosis {
  condition: string;
  likelihood: "HIGH" | "MODERATE" | "LOW";
  clinicalRationale: string;
}

export interface AiClinicalSuggestion {
  id: string;
  visitId?: string;
  patientId: string;
  doctorId: string;
  symptomsReported: string;
  organizedSummary: string;
  differentialDiagnoses: AiDifferentialDiagnosis[];
  differentials?: AiDifferentialDiagnosis[]; // alias
  redFlagsDetected: string[];
  redFlags?: string[]; // alias
  suggestedInvestigations: string[];
  suggestedClinicalQuestions: string[];
  clinicalQuestions?: string[]; // alias
  medicationSafetyChecks?: string[];
  disclaimer: string;
  status:
    | "SUGGESTION_PENDING_REVIEW"
    | "CLINICIAN_APPROVED"
    | "CLINICIAN_EDITED"
    | "DISMISSED"
    | "PENDING"
    | "APPROVED";
  clinicianEdits?: string;
  approvedByDoctorName?: string;
  approvedAt?: string;
  createdAt: string;
}

// -----------------------------------------------------------------------------
// In-App Notification System
// -----------------------------------------------------------------------------
export type NotificationType =
  | "TOKEN_CALLED"
  | "EMERGENCY_ALERT"
  | "APPOINTMENT_REMINDER"
  | "REPORT_READY"
  | "BILL_GENERATED";

export interface AppNotification {
  id: string;
  recipientId: string; // user id
  recipientRole: UserRole;
  hospitalId?: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedEntityId?: string;
  relatedEntityType?: "TOKEN" | "EMERGENCY" | "APPOINTMENT" | "VISIT" | "BILL";
  isRead: boolean;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  createdAt: string;
  readAt?: string;
}

export interface EmergencyCase {
  id: string;
  hospitalId?: string;
  tokenNumber: string;
  patientName: string;
  approxAge?: number;
  gender: string;
  triageLevel: TriageSeverity;
  chiefComplaint: string;
  urgencyChoice?: "CRITICAL_LIFE_THREATENING" | "SERIOUS_URGENT" | "OTHER_EMERGENCY" | "CUSTOM";
  customDescription?: string;
  consciousness: "ALERT" | "VOICE_RESPONSIVE" | "PAIN_RESPONSIVE" | "UNRESPONSIVE";
  arrivalType: "AMBULANCE" | "WALK_IN" | "TRANSFER";
  contactPerson?: string;
  contactPhone?: string;
  assignedBay: string;
  doctorName?: string;
  triageAssignedByStaffName?: string;
  triageAssignedAt?: string;
  status: "TRIAGED" | "ATTENDING" | "STABILIZED" | "ADMITTED_ICU" | "DISCHARGED";
  registeredAt: string;
}

export interface AuditLog {
  id: string;
  hospitalId?: string;
  timestamp: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  entityType:
    | "TOKEN"
    | "APPOINTMENT"
    | "PATIENT"
    | "VISIT"
    | "EMERGENCY"
    | "AUTH"
    | "SETTINGS"
    | "BILL"
    | "PROCEDURE"
    | "AI_CLINICAL"
    | "HOSPITAL";
  entityId: string;
  details: string;
  ipAddress?: string;
}

export interface HospitalSettings {
  hospitalName: string;
  tagline: string;
  contactPhone: string;
  emergencyHotline: string;
  address: string;
  opdStartTime: string;
  opdEndTime: string;
  defaultAvgConsultationMins: number;
  autoCallNextEnabled: boolean;
  smsNotificationEnabled: boolean;
  maxTokensPerDoctorDay: number;
  defaultConsultationFeeInr?: number;
  currencySymbol?: string; // "₹"
}
