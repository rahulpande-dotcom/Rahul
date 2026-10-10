export type UserRole = "admin" | "staff" | "doctor" | "patient";

export type TokenStatus =
  | "WAITING"
  | "CALLED"
  | "IN_CONSULTATION"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type TokenPriority = "NORMAL" | "SENIOR_CITIZEN" | "EMERGENCY";

export type TriageSeverity = "LEVEL_1_RESUSCITATION" | "LEVEL_2_EMERGENT" | "LEVEL_3_URGENT";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  age?: number;
  gender?: "male" | "female" | "other";
  bloodGroup?: string;
  emergencyContact?: string;
  uhid?: string; // Unique Health ID: e.g. QL-2026-8819
  address?: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string; // e.g. GEN, CAR, PED, ORT, NEU, EMG
  floor: string;
  description: string;
  avgConsultationMinutes: number;
  activeDoctorsCount: number;
  iconName?: string;
}

export interface Doctor {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  specialization: string;
  roomNumber: string;
  consultationFee: number;
  availableDays: string[];
  isAvailableToday: boolean;
  avatarUrl?: string;
}

export interface Appointment {
  id: string;
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
  status: "CONFIRMED" | "CHECKED_IN" | "COMPLETED" | "CANCELLED";
  tokenId?: string;
  createdAt: string;
}

export interface Token {
  id: string;
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
  frequency: string; // e.g. "1-0-1 (After Food)"
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
}

export interface Visit {
  id: string;
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
  vitals: VitalSigns;
  prescriptions: PrescriptionItem[];
  doctorAdvice: string;
  followUpDate?: string;
  billingStatus: "PAID" | "PENDING" | "WAIVED";
  billingAmount: number;
  status: "IN_PROGRESS" | "COMPLETED";
}

export interface EmergencyCase {
  id: string;
  tokenNumber: string;
  patientName: string;
  approxAge?: number;
  gender: string;
  triageLevel: TriageSeverity;
  chiefComplaint: string;
  consciousness: "ALERT" | "VOICE_RESPONSIVE" | "PAIN_RESPONSIVE" | "UNRESPONSIVE";
  arrivalType: "AMBULANCE" | "WALK_IN" | "TRANSFER";
  contactPerson?: string;
  contactPhone?: string;
  assignedBay: string;
  doctorName?: string;
  status: "TRIAGED" | "ATTENDING" | "STABILIZED" | "ADMITTED_ICU" | "DISCHARGED";
  registeredAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  entityType: "TOKEN" | "APPOINTMENT" | "PATIENT" | "VISIT" | "EMERGENCY" | "AUTH" | "SETTINGS";
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
}
