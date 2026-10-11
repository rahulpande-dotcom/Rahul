import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import {
  UserProfile,
  Hospital,
  Department,
  Doctor,
  Appointment,
  Token,
  Visit,
  Bill,
  BillItem,
  BillingItemCategory,
  ProcedureRecord,
  AiClinicalSuggestion,
  AppNotification,
  EmergencyCase,
  AuditLog,
  HospitalSettings,
  TokenStatus,
  TokenPriority,
  UserRole,
} from "./types";
import {
  INITIAL_HOSPITALS,
  INITIAL_DEPARTMENTS,
  INITIAL_DOCTORS,
  INITIAL_BILLS,
  INITIAL_PROCEDURES,
} from "./seed-data";
import { getSupabaseServerClient, isSupabaseConfigured } from "./supabase";
import { calculateWaitTime } from "./utils";

// Local filesystem paths
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const TMP_DIR = path.join("/tmp", "queueless-data");
const TMP_DB_FILE = path.join(TMP_DIR, "db.json");

interface DatabaseState {
  profiles: UserProfile[];
  hospitals: Hospital[];
  departments: Department[];
  doctors: Doctor[];
  appointments: Appointment[];
  tokens: Token[];
  visits: Visit[];
  emergencyCases: EmergencyCase[];
  auditLogs: AuditLog[];
  settings: HospitalSettings;
  bills: Bill[];
  procedures: ProcedureRecord[];
  aiSuggestions: AiClinicalSuggestion[];
  notifications: AppNotification[];
}

const INITIAL_STATE: DatabaseState = {
  settings: {
    hospitalName: "QueueLess AI Smart Hospital",
    tagline: "Next-Gen Digital Token & Intelligent OPD Flow Hub",
    contactPhone: "+91 (80) 2658-9111",
    emergencyHotline: "+91 (80) 911-4357",
    address: "450 9th Main Road, Jayanagar 4th Block, Bengaluru, Karnataka 560011",
    opdStartTime: "08:00 AM",
    opdEndTime: "06:00 PM",
    defaultAvgConsultationMins: 12,
    autoCallNextEnabled: true,
    smsNotificationEnabled: true,
    maxTokensPerDoctorDay: 40,
    defaultConsultationFeeInr: 1500,
    currencySymbol: "₹",
  },
  hospitals: INITIAL_HOSPITALS,
  departments: INITIAL_DEPARTMENTS,
  doctors: INITIAL_DOCTORS,
  bills: INITIAL_BILLS,
  procedures: INITIAL_PROCEDURES,
  aiSuggestions: [],
  notifications: [],


  profiles: [
    {
      id: "usr-admin",
      email: "admin@queueless.ai",
      name: "Hospital Administrator",
      role: "admin",
      phone: "+1 (555) 019-2831",
      age: 42,
      gender: "other",
      bloodGroup: "O+",
      emergencyContact: "+1 (555) 911-0001",
      uhid: "QL-ADM-001",
      address: "Admin Suite 12, Main Tower",
      isDemo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "usr-staff",
      email: "staff@queueless.ai",
      name: "Clara Oswald (Head Nurse)",
      role: "staff",
      phone: "+1 (555) 019-4822",
      age: 29,
      gender: "female",
      bloodGroup: "A+",
      emergencyContact: "+1 (555) 911-0002",
      uhid: "QL-STF-014",
      address: "OPD Reception Block B",
      isDemo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "usr-doctor",
      email: "doctor@queueless.ai",
      name: "Dr. Sarah Mitchell, MD",
      role: "doctor",
      phone: "+1 (555) 019-7711",
      age: 38,
      gender: "female",
      bloodGroup: "B+",
      emergencyContact: "+1 (555) 911-0003",
      uhid: "QL-DOC-101",
      address: "Doctor Residences 4B",
      isDemo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "usr-patient",
      email: "patient@queueless.ai",
      name: "Rahul Sharma",
      role: "patient",
      phone: "+1 (555) 019-9944",
      age: 32,
      gender: "male",
      bloodGroup: "O+",
      emergencyContact: "+1 (555) 992-1234",
      uhid: "QL-2026-8819",
      address: "74 Silicon Valley Avenue, Metro City",
      isDemo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  tokens: [
    {
      id: "tok-101",
      tokenNumber: "OPD-GEN-101",
      departmentId: "dept-gen",
      departmentName: "General Medicine",
      departmentCode: "GEN",
      doctorId: "doc-1",
      doctorName: "Dr. Sarah Mitchell, MD",
      roomNumber: "Room 101",
      patientId: "usr-patient",
      patientName: "Rahul Sharma",
      patientAge: 32,
      patientGender: "male",
      patientPhone: "+1 (555) 019-9944",
      isEmergency: false,
      priority: "NORMAL",
      status: "CALLED",
      type: "ONLINE",
      queuePosition: 1,
      estimatedWaitMinutes: 0,
      symptoms: "Persistent headache, mild fever for 2 days",
      isDemo: true,
      generatedAt: new Date(Date.now() - 45 * 60000).toISOString(),
      checkInAt: new Date(Date.now() - 25 * 60000).toISOString(),
      calledAt: new Date(Date.now() - 2 * 60000).toISOString(),
    },
    {
      id: "tok-102",
      tokenNumber: "OPD-GEN-102",
      departmentId: "dept-gen",
      departmentName: "General Medicine",
      departmentCode: "GEN",
      doctorId: "doc-1",
      doctorName: "Dr. Sarah Mitchell, MD",
      roomNumber: "Room 101",
      patientName: "Eleanor Vance (Senior)",
      patientAge: 68,
      patientGender: "female",
      patientPhone: "+1 (555) 332-9011",
      isEmergency: false,
      priority: "SENIOR_CITIZEN",
      status: "WAITING",
      type: "WALK_IN",
      queuePosition: 2,
      estimatedWaitMinutes: 10,
      symptoms: "Chronic joint stiffness and routine wellness checkup",
      isDemo: true,
      generatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
      checkInAt: new Date(Date.now() - 20 * 60000).toISOString(),
    },
    {
      id: "tok-103",
      tokenNumber: "OPD-CAR-201",
      departmentId: "dept-car",
      departmentName: "Cardiology",
      departmentCode: "CAR",
      doctorId: "doc-2",
      doctorName: "Dr. Arjun Mehta, DM",
      roomNumber: "Room 204",
      patientName: "Michael Chang",
      patientAge: 45,
      patientGender: "male",
      patientPhone: "+1 (555) 441-2998",
      isEmergency: false,
      priority: "NORMAL",
      status: "IN_CONSULTATION",
      type: "ONLINE",
      queuePosition: 1,
      estimatedWaitMinutes: 0,
      symptoms: "Mild palpitations following physical exertion",
      isDemo: true,
      generatedAt: new Date(Date.now() - 60 * 60000).toISOString(),
      checkInAt: new Date(Date.now() - 35 * 60000).toISOString(),
      calledAt: new Date(Date.now() - 15 * 60000).toISOString(),
      consultationStartAt: new Date(Date.now() - 10 * 60000).toISOString(),
    },
    {
      id: "tok-104",
      tokenNumber: "EMG-012",
      departmentId: "dept-emg",
      departmentName: "Emergency & Trauma",
      departmentCode: "EMG",
      doctorId: "doc-6",
      doctorName: "Dr. David Vance, MD",
      roomNumber: "ER Bay 1",
      patientName: "Unidentified Male (Trauma)",
      patientAge: 35,
      patientGender: "male",
      isEmergency: true,
      priority: "EMERGENCY",
      status: "CALLED",
      type: "EMERGENCY",
      queuePosition: 1,
      estimatedWaitMinutes: 0,
      symptoms: "Severe lacerations, motor accident trauma, conscious",
      isDemo: true,
      generatedAt: new Date(Date.now() - 12 * 60000).toISOString(),
      checkInAt: new Date(Date.now() - 12 * 60000).toISOString(),
      calledAt: new Date(Date.now() - 10 * 60000).toISOString(),
    },
  ],
  appointments: [
    {
      id: "apt-1",
      patientId: "usr-patient",
      patientName: "Rahul Sharma",
      patientPhone: "+1 (555) 019-9944",
      patientEmail: "patient@queueless.ai",
      doctorId: "doc-1",
      doctorName: "Dr. Sarah Mitchell, MD",
      departmentId: "dept-gen",
      departmentName: "General Medicine",
      date: new Date().toISOString().split("T")[0],
      timeSlot: "10:30 AM",
      reason: "Persistent fever and headache follow-up",
      status: "CHECKED_IN",
      tokenId: "tok-101",
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      id: "apt-2",
      patientId: "usr-patient",
      patientName: "Rahul Sharma",
      patientPhone: "+1 (555) 019-9944",
      patientEmail: "patient@queueless.ai",
      doctorId: "doc-2",
      doctorName: "Dr. Arjun Mehta, DM",
      departmentId: "dept-car",
      departmentName: "Cardiology",
      date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      timeSlot: "11:15 AM",
      reason: "Preventive ECG and cardiovascular fitness evaluation",
      status: "CONFIRMED",
      createdAt: new Date().toISOString(),
    },
  ],
  visits: [
    {
      id: "vst-1",
      visitNumber: "VST-2026-1001",
      tokenId: "tok-prev-1",
      tokenNumber: "OPD-GEN-088",
      patientId: "usr-patient",
      patientName: "Rahul Sharma",
      patientAge: 32,
      patientGender: "male",
      uhid: "QL-2026-8819",
      doctorId: "doc-1",
      doctorName: "Dr. Sarah Mitchell, MD",
      departmentName: "General Medicine",
      roomNumber: "Room 101",
      visitDate: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0],
      checkInTimestamp: new Date(Date.now() - 7 * 86400000 + 3600000 * 9).toISOString(),
      consultationTimestamp: new Date(Date.now() - 7 * 86400000 + 3600000 * 9.5).toISOString(),
      checkoutTimestamp: new Date(Date.now() - 7 * 86400000 + 3600000 * 9.8).toISOString(),
      symptoms: "Upper respiratory congestion, sore throat, mild body ache",
      diagnosis: "Acute Viral Rhinitis with mild pharyngitis (ICD-10 J00)",
      vitals: {
        bloodPressure: "118/78 mmHg",
        pulseRate: 74,
        temperature: 99.1,
        spO2: 99,
        weightKg: 72,
        bloodGlucose: 96,
      },
      prescriptions: [
        {
          id: "rx-1",
          medicineName: "Paracetamol 650mg",
          dosage: "650mg tablet",
          frequency: "1-0-1 (After Food)",
          duration: "3 Days",
          instructions: "Take when body temperature exceeds 99°F",
        },
        {
          id: "rx-2",
          medicineName: "Cetirizine 10mg",
          dosage: "10mg tablet",
          frequency: "0-0-1 (At Bedtime)",
          duration: "5 Days",
          instructions: "May cause mild drowsiness; stay well hydrated",
        },
        {
          id: "rx-3",
          medicineName: "Vitamin C 500mg Chewable",
          dosage: "500mg chewable",
          frequency: "1-0-0 (Morning)",
          duration: "10 Days",
          instructions: "Chew after breakfast",
        },
      ],
      doctorAdvice: "Warm saline gargle twice daily. Rest and avoid cold beverages. Re-consult if fever persists over 101°F.",
      followUpDate: new Date(Date.now() - 7 * 86400000 + 14 * 86400000).toISOString().split("T")[0],
      billingStatus: "PAID",
      billingAmount: 500,
      status: "COMPLETED",
    },
  ],
  emergencyCases: [
    {
      id: "emg-case-1",
      tokenNumber: "EMG-012",
      patientName: "Unidentified Male (Trauma)",
      approxAge: 35,
      gender: "male",
      triageLevel: "LEVEL_1_RESUSCITATION",
      chiefComplaint: "Road accident trauma, multiple skin abrasions, stable respiration",
      consciousness: "ALERT",
      arrivalType: "AMBULANCE",
      contactPerson: "Paramedic Dispatch #4",
      contactPhone: "+1 (555) 911-0404",
      assignedBay: "ER Bay 1",
      doctorName: "Dr. David Vance, MD",
      status: "ATTENDING",
      registeredAt: new Date(Date.now() - 15 * 60000).toISOString(),
    },
  ],
  auditLogs: [
    {
      id: "log-1",
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
      actorEmail: "staff@queueless.ai",
      actorRole: "staff",
      action: "PATIENT_CHECKED_IN",
      entityType: "TOKEN",
      entityId: "tok-101",
      details: "Patient Rahul Sharma checked in at OPD Desk A. Token OPD-GEN-101 assigned.",
      ipAddress: "127.0.0.1",
    },
    {
      id: "log-2",
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      actorEmail: "emergency-public@queueless.ai",
      actorRole: "staff",
      action: "EMERGENCY_TRIAGE_REGISTERED",
      entityType: "EMERGENCY",
      entityId: "EMG-012",
      details: "Immediate Level 1 Emergency trauma intake recorded. Bay 1 alerted.",
      ipAddress: "192.168.1.105",
    },
    {
      id: "log-3",
      timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
      actorEmail: "doctor@queueless.ai",
      actorRole: "doctor",
      action: "TOKEN_CALLED",
      entityType: "TOKEN",
      entityId: "tok-101",
      details: "Token OPD-GEN-101 called to Room 101 for consultation.",
      ipAddress: "127.0.0.1",
    },
  ],
};

// In-memory queue lock for concurrency control
let queueActionLock: Promise<any> = Promise.resolve();
function acquireQueueLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = queueActionLock.then(fn, fn);
  queueActionLock = next;
  return next;
}

let inMemoryState: DatabaseState | null = null;

function sanitizeLoadedState(parsed: any): DatabaseState {
  if (!parsed) return INITIAL_STATE;

  const primaryHospId = "hosp-queueless-blr";

  // Ensure hospitals exist and include all 10 verified hospitals
  if (!Array.isArray(parsed.hospitals) || parsed.hospitals.length < INITIAL_HOSPITALS.length) {
    const existingHospMap = new Map((parsed.hospitals || []).map((h: any) => [h.id, h]));
    parsed.hospitals = INITIAL_HOSPITALS.map((initH) => existingHospMap.get(initH.id) || initH);
  }

  // Ensure departments include all 20 departments from INITIAL_DEPARTMENTS with standardized naming
  const existingDeptMap = new Map((parsed.departments || []).map((d: any) => [d.id, d]));
  parsed.departments = INITIAL_DEPARTMENTS.map((initD) => {
    const existing = existingDeptMap.get(initD.id);
    return existing ? { ...initD, ...existing, name: initD.name, code: initD.code } : initD;
  });

  // Ensure doctors include all 80 doctors from INITIAL_DOCTORS with synchronized department names
  const existingDocMap = new Map((parsed.doctors || []).map((d: any) => [d.id, d]));
  parsed.doctors = INITIAL_DOCTORS.map((initDoc) => {
    const existing = existingDocMap.get(initDoc.id);
    return existing ? { ...initDoc, ...existing, departmentName: initDoc.departmentName } : initDoc;
  });

  if (!Array.isArray(parsed.profiles)) parsed.profiles = INITIAL_STATE.profiles;
  if (!Array.isArray(parsed.tokens)) parsed.tokens = [];
  if (!Array.isArray(parsed.appointments)) parsed.appointments = [];
  if (!Array.isArray(parsed.visits)) parsed.visits = [];
  if (!Array.isArray(parsed.emergencyCases)) parsed.emergencyCases = [];
  if (!Array.isArray(parsed.auditLogs)) parsed.auditLogs = [];
  if (!Array.isArray(parsed.bills) || parsed.bills.length === 0) parsed.bills = INITIAL_STATE.bills;
  if (!Array.isArray(parsed.procedures) || parsed.procedures.length === 0) parsed.procedures = INITIAL_STATE.procedures;
  if (!Array.isArray(parsed.aiSuggestions)) parsed.aiSuggestions = [];
  if (!Array.isArray(parsed.notifications)) parsed.notifications = [];

  // Align bill aliases
  parsed.bills.forEach((b: any) => {
    b.totalAmount = b.totalPayable ?? b.totalAmount ?? 0;
    b.status = b.paymentStatus ?? b.status ?? "PENDING";
    b.currency = b.currency || "INR";
  });

  if (!parsed.settings) {
    parsed.settings = INITIAL_STATE.settings;
  } else {
    parsed.settings.currencySymbol = "₹";
    parsed.settings.defaultConsultationFeeInr = parsed.settings.defaultConsultationFeeInr || 1500;
  }

  // Ensure hospitalId on existing records if missing
  parsed.tokens.forEach((t: any) => {
    if (!t.hospitalId) t.hospitalId = primaryHospId;
  });
  parsed.visits.forEach((v: any) => {
    if (!v.hospitalId) v.hospitalId = primaryHospId;
  });
  parsed.appointments.forEach((a: any) => {
    if (!a.hospitalId) a.hospitalId = primaryHospId;
  });
  parsed.emergencyCases.forEach((e: any) => {
    if (!e.hospitalId) e.hospitalId = primaryHospId;
  });

  return parsed as DatabaseState;
}

function readLocalDb(): DatabaseState {
  if (inMemoryState) {
    return inMemoryState;
  }
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.tokens)) {
        inMemoryState = sanitizeLoadedState(parsed);
        return inMemoryState;
      }
    }

    if (fs.existsSync(TMP_DB_FILE)) {
      try {
        const rawTmp = fs.readFileSync(TMP_DB_FILE, "utf-8");
        const parsedTmp = JSON.parse(rawTmp);
        if (parsedTmp && Array.isArray(parsedTmp.tokens)) {
          inMemoryState = sanitizeLoadedState(parsedTmp);
          return inMemoryState;
        }
      } catch {
        // ignore
      }
    }

    // Initialize if neither exists
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_STATE, null, 2), "utf-8");
    } catch {
      try {
        if (!fs.existsSync(TMP_DIR)) {
          fs.mkdirSync(TMP_DIR, { recursive: true });
        }
        fs.writeFileSync(TMP_DB_FILE, JSON.stringify(INITIAL_STATE, null, 2), "utf-8");
      } catch {
        // ignore
      }
    }

    inMemoryState = INITIAL_STATE;
    return INITIAL_STATE;
  } catch (err) {
    console.error("[Local DB] Error reading local db, using INITIAL_STATE:", (err as Error).message);
    return INITIAL_STATE;
  }
}

function writeLocalDb(state: DatabaseState): void {
  inMemoryState = state;
  let wrotePrimary = false;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
    wrotePrimary = true;
  } catch (err) {
    // Read-only filesystem (serverless environment)
  }

  if (!wrotePrimary) {
    try {
      if (!fs.existsSync(TMP_DIR)) {
        fs.mkdirSync(TMP_DIR, { recursive: true });
      }
      fs.writeFileSync(TMP_DB_FILE, JSON.stringify(state, null, 2), "utf-8");
    } catch (err) {
      console.error("[Local DB] Failed to write fallback tmp db:", (err as Error).message);
    }
  }
}

// -----------------------------------------------------------------------------
// Universal DB Provider
// -----------------------------------------------------------------------------
export const db = {
  // Profiles (Registered Patients & Staff)
  async getProfiles(): Promise<UserProfile[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseServerClient();
      if (client) {
        try {
          const { data, error } = await client.from("profiles").select("*");
          if (error) {
            console.error("[Supabase Sync] getProfiles query error:", error.message);
          } else if (data && data.length > 0) {
            const mapped = data.map((d: any) => ({
              id: String(d.id),
              email: d.email,
              name: d.name,
              role: d.role,
              phone: d.phone,
              age: d.age ? Number(d.age) : undefined,
              gender: d.gender,
              bloodGroup: d.blood_group,
              emergencyContact: d.emergency_contact,
              uhid: d.uhid,
              address: d.address,
              isDemo: Boolean(d.is_demo),
              createdAt: d.created_at || new Date().toISOString(),
              updatedAt: d.updated_at || new Date().toISOString(),
            }));

            // Check if local DB has additional non-demo profiles that haven't been synced to Supabase yet
            const local = readLocalDb();
            const existingEmails = new Set(mapped.map((p: UserProfile) => p.email.toLowerCase()));
            const missingFromSupabase = local.profiles.filter(
              (p) => !existingEmails.has(p.email.toLowerCase())
            );

            if (missingFromSupabase.length > 0) {
              // Asynchronously backfill missing profiles to Supabase
              for (const p of missingFromSupabase) {
                client
                  .from("profiles")
                  .insert({
                    id: p.id,
                    email: p.email,
                    name: p.name,
                    role: p.role,
                    phone: p.phone,
                    age: p.age,
                    gender: p.gender,
                    blood_group: p.bloodGroup,
                    emergency_contact: p.emergencyContact,
                    uhid: p.uhid,
                    address: p.address,
                    is_demo: Boolean(p.isDemo),
                  })
                  .then(({ error: insertErr }) => {
                    if (insertErr) {
                      console.error("[Supabase Sync] Backfill profile failed:", insertErr.message);
                    }
                  });
              }
              return [...mapped, ...missingFromSupabase];
            }

            return mapped;
          }
        } catch (err) {
          console.error("[Supabase Sync] getProfiles exception, fallback to local:", (err as Error).message);
        }
      }
    }
    const local = readLocalDb();
    return local.profiles;
  },

  async getProfileByEmail(email: string): Promise<UserProfile | null> {
    const profiles = await db.getProfiles();
    return profiles.find((p) => p.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async getProfileById(id: string): Promise<UserProfile | null> {
    const profiles = await db.getProfiles();
    return profiles.find((p) => p.id === id) || null;
  },

  async createProfile(profile: UserProfile): Promise<UserProfile> {
    // Ensure profile has a valid ID
    if (!profile.id) {
      profile.id = randomUUID();
    }

    if (isSupabaseConfigured()) {
      const client = getSupabaseServerClient();
      if (client) {
        try {
          const { error } = await client.from("profiles").upsert(
            {
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role,
              phone: profile.phone,
              age: profile.age,
              gender: profile.gender,
              blood_group: profile.bloodGroup,
              emergency_contact: profile.emergencyContact,
              uhid: profile.uhid,
              address: profile.address,
              is_demo: Boolean(profile.isDemo),
            },
            { onConflict: "email" }
          );
          if (error) {
            console.error("[Supabase Sync] createProfile error:", error.message);
          }
        } catch (err) {
          console.error("[Supabase Sync] createProfile exception:", (err as Error).message);
        }
      }
    }

    const local = readLocalDb();
    const existingIndex = local.profiles.findIndex(
      (p) => p.email.toLowerCase() === profile.email.toLowerCase()
    );
    if (existingIndex >= 0) {
      local.profiles[existingIndex] = { ...local.profiles[existingIndex], ...profile };
    } else {
      local.profiles.push(profile);
    }
    writeLocalDb(local);
    return profile;
  },

  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const local = readLocalDb();
    const idx = local.profiles.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const updated = { ...local.profiles[idx], ...updates, updatedAt: new Date().toISOString() };
    local.profiles[idx] = updated;
    writeLocalDb(local);

    if (isSupabaseConfigured()) {
      const client = getSupabaseServerClient();
      if (client) {
        try {
          const { error } = await client
            .from("profiles")
            .update({
              name: updated.name,
              phone: updated.phone,
              age: updated.age,
              gender: updated.gender,
              blood_group: updated.bloodGroup,
              emergency_contact: updated.emergencyContact,
              address: updated.address,
              updated_at: updated.updatedAt,
            })
            .eq("id", id);
          if (error) {
            console.error("[Supabase Sync] updateProfile error:", error.message);
          }
        } catch (err) {
          console.error("[Supabase Sync] updateProfile exception:", (err as Error).message);
        }
      }
    }

    return updated;
  },

  // Hospitals (Multi-Hospital Directory across Bengaluru & Tumakuru)
  async getHospitals(): Promise<Hospital[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseServerClient();
      if (client) {
        try {
          const { data, error } = await client.from("hospitals").select("*");
          if (!error && data && data.length > 0) {
            return data.map((h: any) => ({
              id: String(h.id),
              name: h.name,
              code: h.code,
              tagline: h.tagline,
              district: h.district,
              city: h.city,
              locality: h.locality,
              address: h.address,
              contactPhone: h.contact_phone,
              emergencyHotline: h.emergency_hotline,
              website: h.website,
              email: h.email,
              isPrimary: Boolean(h.is_primary),
              verificationStatus: h.verification_status || "VERIFIED",
              verificationSource: h.verification_source,
              activeDepartmentsCount: Number(h.active_departments_count) || 20,
              totalDoctorsCount: Number(h.total_doctors_count) || 80,
              createdAt: h.created_at || new Date().toISOString(),
              updatedAt: h.updated_at || new Date().toISOString(),
            }));
          }
        } catch {
          // ignore, fallback to local
        }
      }
    }
    return readLocalDb().hospitals;
  },

  async getHospitalById(id: string): Promise<Hospital | null> {
    const hospitals = await db.getHospitals();
    return (
      hospitals.find(
        (h) => h.id === id || h.code.toLowerCase() === id.toLowerCase()
      ) || null
    );
  },

  async createHospital(hospital: Hospital): Promise<Hospital> {
    if (!hospital.id) hospital.id = randomUUID();
    const local = readLocalDb();
    local.hospitals.push(hospital);
    writeLocalDb(local);
    return hospital;
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseServerClient();
      if (client) {
        try {
          const { data, error } = await client.from("departments").select("*");
          if (error) {
            console.error("[Supabase Sync] getDepartments error:", error.message);
          } else if (data && data.length > 0) {
            return data.map((d: any) => ({
              id: String(d.id),
              hospitalId: d.hospital_id || "hosp-queueless-blr",
              name: d.name,
              code: d.code,
              floor: d.floor,
              description: d.description,
              avgConsultationMinutes: d.avg_consultation_minutes || 12,
              activeDoctorsCount: d.active_doctors_count || 4,
              iconName: d.icon_name || "Activity",
              imageUrl: d.image_url,
              roomNumbers: d.room_numbers,
              standardFee: d.standard_fee ? Number(d.standard_fee) : 1500,
              headDoctorName: d.head_doctor_name,
              active: d.active !== undefined ? Boolean(d.active) : true,
            }));
          }
        } catch (err) {
          console.error("[Supabase Sync] getDepartments exception:", (err as Error).message);
        }
      }
    }
    return readLocalDb().departments;
  },

  async getDepartmentById(id: string): Promise<Department | null> {
    const depts = await db.getDepartments();
    return (
      depts.find(
        (d) => d.id === id || d.code.toLowerCase() === id.toLowerCase()
      ) || null
    );
  },

  async createDepartment(dept: Department): Promise<Department> {
    if (!dept.id) dept.id = randomUUID();
    const local = readLocalDb();
    local.departments.push(dept);
    writeLocalDb(local);
    return dept;
  },

  // Doctors
  async getDoctors(): Promise<Doctor[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseServerClient();
      if (client) {
        try {
          const { data, error } = await client.from("doctors").select("*");
          if (error) {
            console.error("[Supabase Sync] getDoctors error:", error.message);
          } else if (data && data.length > 0) {
            return data.map((d: any) => ({
              id: String(d.id),
              hospitalId: d.hospital_id || "hosp-queueless-blr",
              name: d.name,
              departmentId: String(d.department_id),
              departmentName: d.department_name,
              specialization: d.specialization,
              qualifications: d.qualifications,
              experienceYears: d.experience_years ? Number(d.experience_years) : undefined,
              roomNumber: d.room_number,
              consultationFee: Number(d.consultation_fee) || 1500,
              availableDays: d.available_days || [],
              isAvailableToday: Boolean(d.is_available_today),
              appointmentCapacityPerDay: d.appointment_capacity_per_day ? Number(d.appointment_capacity_per_day) : 40,
              status: (d.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
              isDemo: Boolean(d.is_demo),
              avatarUrl: d.avatar_url,
            }));
          }
        } catch (err) {
          console.error("[Supabase Sync] getDoctors exception:", (err as Error).message);
        }
      }
    }
    return readLocalDb().doctors;
  },

  async getDoctorById(id: string): Promise<Doctor | null> {
    const doctors = await db.getDoctors();
    return doctors.find((d) => d.id === id) || null;
  },

  async createDoctor(doctor: Doctor): Promise<Doctor> {
    if (!doctor.id) doctor.id = randomUUID();
    const local = readLocalDb();

    const targetHospitalId = doctor.hospitalId || "hosp-queueless-blr";
    const normalizedName = doctor.name.trim().toLowerCase();

    // Normalized case-insensitive unique display name check within hospital
    const duplicate = local.doctors.find(
      (d) =>
        (d.hospitalId || "hosp-queueless-blr") === targetHospitalId &&
        d.name.trim().toLowerCase() === normalizedName
    );
    if (duplicate) {
      throw new Error(`Doctor with name "${doctor.name}" already exists in this hospital.`);
    }

    // Server-side validate consultation fee in INR (₹1,000 - ₹3,000)
    let fee = Number(doctor.consultationFee);
    if (isNaN(fee) || fee < 1000 || fee > 3000) {
      fee = Math.max(1000, Math.min(3000, isNaN(fee) ? 1500 : fee));
    }
    doctor.consultationFee = fee;
    doctor.hospitalId = targetHospitalId;
    doctor.status = doctor.status || "ACTIVE";

    local.doctors.push(doctor);
    writeLocalDb(local);
    return doctor;
  },

  async updateDoctor(id: string, updates: Partial<Doctor>): Promise<Doctor | null> {
    const local = readLocalDb();
    const idx = local.doctors.findIndex((d) => d.id === id);
    if (idx === -1) return null;

    if (updates.name) {
      const normalizedName = updates.name.trim().toLowerCase();
      const targetHospitalId = updates.hospitalId || local.doctors[idx].hospitalId || "hosp-queueless-blr";
      const duplicate = local.doctors.find(
        (d) =>
          d.id !== id &&
          (d.hospitalId || "hosp-queueless-blr") === targetHospitalId &&
          d.name.trim().toLowerCase() === normalizedName
      );
      if (duplicate) {
        throw new Error(`Doctor with name "${updates.name}" already exists in this hospital.`);
      }
    }

    if (updates.consultationFee !== undefined) {
      let fee = Number(updates.consultationFee);
      if (isNaN(fee) || fee < 1000 || fee > 3000) {
        fee = Math.max(1000, Math.min(3000, isNaN(fee) ? 1500 : fee));
      }
      updates.consultationFee = fee;
    }

    local.doctors[idx] = { ...local.doctors[idx], ...updates };
    writeLocalDb(local);
    return local.doctors[idx];
  },

  // Tokens (Queue Management)
  async getTokens(): Promise<Token[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseServerClient();
      if (client) {
        try {
          const { data, error } = await client
            .from("tokens")
            .select("*")
            .order("generated_at", { ascending: true });
          if (error) {
            console.error("[Supabase Sync] getTokens error:", error.message);
          } else if (data && data.length > 0) {
            const mapped = data.map((t: any) => ({
              id: String(t.id),
              tokenNumber: t.token_number,
              departmentId: String(t.department_id),
              departmentName: t.department_name,
              departmentCode: t.department_code,
              doctorId: t.doctor_id ? String(t.doctor_id) : undefined,
              doctorName: t.doctor_name,
              roomNumber: t.room_number,
              patientId: t.patient_id ? String(t.patient_id) : undefined,
              patientName: t.patient_name,
              patientAge: t.patient_age ? Number(t.patient_age) : undefined,
              patientGender: t.patient_gender,
              patientPhone: t.patient_phone,
              isEmergency: Boolean(t.is_emergency),
              priority: t.priority as TokenPriority,
              status: t.status as TokenStatus,
              type: t.type,
              queuePosition: Number(t.queue_position) || 1,
              estimatedWaitMinutes: Number(t.estimated_wait_minutes) || 10,
              symptoms: t.symptoms,
              isDemo: Boolean(t.is_demo),
              generatedAt: t.generated_at,
              checkInAt: t.check_in_at,
              calledAt: t.called_at,
              consultationStartAt: t.consultation_start_at,
              completedAt: t.completed_at,
            }));

            // Sync with local memory cache
            const local = readLocalDb();
            local.tokens = mapped;
            writeLocalDb(local);
            return mapped;
          } else {
            // Supabase tokens table is empty! Check if local store has initial/existing tokens to seed
            const local = readLocalDb();
            if (local.tokens.length > 0) {
              for (const tok of local.tokens) {
                client
                  .from("tokens")
                  .insert({
                    id: tok.id,
                    token_number: tok.tokenNumber,
                    department_id: tok.departmentId,
                    department_name: tok.departmentName,
                    department_code: tok.departmentCode,
                    doctor_id: tok.doctorId,
                    doctor_name: tok.doctorName,
                    room_number: tok.roomNumber,
                    patient_id: tok.patientId,
                    patient_name: tok.patientName,
                    patient_age: tok.patientAge,
                    patient_gender: tok.patientGender,
                    patient_phone: tok.patientPhone,
                    is_emergency: tok.isEmergency,
                    priority: tok.priority,
                    status: tok.status,
                    type: tok.type,
                    queue_position: tok.queuePosition,
                    estimated_wait_minutes: tok.estimatedWaitMinutes,
                    symptoms: tok.symptoms,
                    is_demo: Boolean(tok.isDemo),
                    generated_at: tok.generatedAt,
                    check_in_at: tok.checkInAt,
                    called_at: tok.calledAt,
                    consultation_start_at: tok.consultationStartAt,
                    completed_at: tok.completedAt,
                  })
                  .then(({ error: tokErr }) => {
                    if (tokErr) {
                      console.error("[Supabase Sync] Seed token failed:", tokErr.message);
                    }
                  });
              }
              return local.tokens;
            }
          }
        } catch (err) {
          console.error("[Supabase Sync] getTokens exception, fallback to local:", (err as Error).message);
        }
      }
    }
    return readLocalDb().tokens;
  },

  async getTokenById(id: string): Promise<Token | null> {
    const tokens = await db.getTokens();
    return (
      tokens.find(
        (t) => t.id === id || t.tokenNumber.toUpperCase() === id.toUpperCase()
      ) || null
    );
  },

  async createToken(token: Token): Promise<Token> {
    return acquireQueueLock(async () => {
      // Ensure universal ID
      if (!token.id) {
        token.id = randomUUID();
      }

      const local = readLocalDb();
      // Calculate queue position based on active waiting tokens for this department
      const activeWaiting = local.tokens.filter(
        (t) =>
          (t.departmentId === token.departmentId || t.departmentCode === token.departmentCode) &&
          (t.status === "WAITING" || t.status === "CHECKED_IN")
      );
      token.queuePosition = token.priority === "EMERGENCY" ? 1 : activeWaiting.length + 1;
      token.estimatedWaitMinutes = calculateWaitTime(token.queuePosition, 12, token.priority);

      if (isSupabaseConfigured()) {
        const client = getSupabaseServerClient();
        if (client) {
          try {
            const { error } = await client.from("tokens").insert({
              id: token.id,
              token_number: token.tokenNumber,
              department_id: token.departmentId,
              department_name: token.departmentName,
              department_code: token.departmentCode,
              doctor_id: token.doctorId,
              doctor_name: token.doctorName,
              room_number: token.roomNumber,
              patient_id: token.patientId,
              patient_name: token.patientName,
              patient_age: token.patientAge,
              patient_gender: token.patientGender,
              patient_phone: token.patientPhone,
              is_emergency: token.isEmergency,
              priority: token.priority,
              status: token.status,
              type: token.type,
              queue_position: token.queuePosition,
              estimated_wait_minutes: token.estimatedWaitMinutes,
              symptoms: token.symptoms,
              is_demo: Boolean(token.isDemo),
              generated_at: token.generatedAt,
              check_in_at: token.checkInAt,
            });
            if (error) {
              console.error("[Supabase Sync] createToken error:", error.message);
            }
          } catch (err) {
            console.error("[Supabase Sync] createToken exception:", (err as Error).message);
          }
        }
      }

      local.tokens.push(token);
      writeLocalDb(local);
      return token;
    });
  },

  async updateTokenStatus(
    id: string,
    status: TokenStatus,
    additionalData?: Partial<Token>
  ): Promise<Token | null> {
    return acquireQueueLock(async () => {
      const local = readLocalDb();
      const idx = local.tokens.findIndex((t) => t.id === id || t.tokenNumber === id);
      if (idx === -1) return null;

      const now = new Date().toISOString();
      const token = local.tokens[idx];
      token.status = status;

      if (status === "CALLED") {
        token.calledAt = now;
      } else if (status === "IN_CONSULTATION") {
        token.consultationStartAt = now;
      } else if (status === "COMPLETED" || (status as string) === "CHECKED_OUT") {
        token.completedAt = now;
        token.status = "COMPLETED";
      }

      if (additionalData) {
        Object.assign(token, additionalData);
      }

      // Re-adjust queue positions for waiting tokens in this department
      let pos = 1;
      for (const t of local.tokens) {
        if (
          (t.departmentId === token.departmentId || t.departmentCode === token.departmentCode) &&
          (t.status === "WAITING" || t.status === "CHECKED_IN")
        ) {
          t.queuePosition = pos++;
          t.estimatedWaitMinutes = calculateWaitTime(t.queuePosition, 12, t.priority);
        }
      }

      writeLocalDb(local);

      if (isSupabaseConfigured()) {
        const client = getSupabaseServerClient();
        if (client) {
          try {
            const { error } = await client
              .from("tokens")
              .update({
                status: token.status,
                called_at: token.calledAt,
                consultation_start_at: token.consultationStartAt,
                completed_at: token.completedAt,
                doctor_id: token.doctorId,
                doctor_name: token.doctorName,
                room_number: token.roomNumber,
              })
              .eq("id", token.id);
            if (error) {
              console.error("[Supabase Sync] updateTokenStatus error:", error.message);
            }
          } catch (err) {
            console.error("[Supabase Sync] updateTokenStatus exception:", (err as Error).message);
          }
        }
      }

      return token;
    });
  },

  // Concurrency-Safe Call Next Waiting Token
  async callNextWaitingToken(options: {
    departmentId?: string;
    doctorId?: string;
    callerEmail?: string;
    callerRole?: string;
  }): Promise<Token | null> {
    return acquireQueueLock(async () => {
      const { departmentId, doctorId } = options;
      const allTokens = await db.getTokens();
      const departments = await db.getDepartments();
      const doctors = await db.getDoctors();

      // Find target department if specified
      const targetDept = departmentId && departmentId !== "ALL"
        ? departments.find((d) => d.id === departmentId || d.code.toLowerCase() === departmentId.toLowerCase())
        : null;

      // Filter waiting tokens
      const eligible = allTokens.filter((t) => {
        // Department check
        const matchDept = departmentId && departmentId !== "ALL"
          ? t.departmentId === departmentId ||
            t.departmentCode?.toLowerCase() === departmentId.toLowerCase() ||
            (targetDept
              ? t.departmentId === targetDept.id || t.departmentCode === targetDept.code
              : false)
          : true;

        // Doctor check
        const matchDoc = doctorId && doctorId !== "ALL" ? t.doctorId === doctorId : true;

        // Status check
        const isWaiting = t.status === "WAITING" || t.status === "CHECKED_IN";

        return matchDept && matchDoc && isWaiting;
      });

      if (eligible.length === 0) {
        return null;
      }

      // Priority triage sort: EMERGENCY (0) > SENIOR_CITIZEN (1) > NORMAL (2), then FIFO by generatedAt
      const priorityOrder: Record<string, number> = {
        EMERGENCY: 0,
        SENIOR_CITIZEN: 1,
        NORMAL: 2,
      };

      eligible.sort((a, b) => {
        const pDiff = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
        if (pDiff !== 0) return pDiff;
        return new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime();
      });

      const candidate = eligible[0];

      // Assign doctor & room if unassigned
      let assignedDoc = doctorId && doctorId !== "ALL" ? doctors.find((d) => d.id === doctorId) : null;
      if (!assignedDoc) {
        // Auto-assign doctor from candidate's department
        assignedDoc = doctors.find(
          (d) =>
            (d.departmentId === candidate.departmentId || d.departmentName === candidate.departmentName) &&
            d.isAvailableToday
        ) || null;
      }

      const assignedRoom = assignedDoc?.roomNumber || candidate.roomNumber || "Room 101";
      const assignedDoctorId = assignedDoc?.id || candidate.doctorId;
      const assignedDoctorName = assignedDoc?.name || candidate.doctorName;

      // Atomic update
      const now = new Date().toISOString();
      const local = readLocalDb();
      const idx = local.tokens.findIndex((t) => t.id === candidate.id);
      if (idx === -1) return null;

      // Verify status didn't change concurrently
      if (local.tokens[idx].status !== "WAITING" && local.tokens[idx].status !== "CHECKED_IN") {
        return null;
      }

      local.tokens[idx].status = "CALLED";
      local.tokens[idx].calledAt = now;
      if (assignedDoctorId) local.tokens[idx].doctorId = assignedDoctorId;
      if (assignedDoctorName) local.tokens[idx].doctorName = assignedDoctorName;
      if (assignedRoom) local.tokens[idx].roomNumber = assignedRoom;

      // Re-adjust queue positions for remaining waiting tokens
      let pos = 1;
      for (const t of local.tokens) {
        if (
          (t.departmentId === candidate.departmentId || t.departmentCode === candidate.departmentCode) &&
          (t.status === "WAITING" || t.status === "CHECKED_IN")
        ) {
          t.queuePosition = pos++;
          t.estimatedWaitMinutes = calculateWaitTime(t.queuePosition, 12, t.priority);
        }
      }

      // Automatically trigger in-app notification for patient
      if (candidate.patientId) {
        local.notifications.unshift({
          id: randomUUID(),
          recipientId: candidate.patientId,
          recipientRole: "patient",
          hospitalId: candidate.hospitalId || "hosp-queueless-blr",
          title: `Token ${candidate.tokenNumber} Called!`,
          message: `Your token ${candidate.tokenNumber} has been called for consultation with ${assignedDoctorName || "the doctor"} at ${assignedRoom || "Room 101"}. Please proceed inside.`,
          type: "TOKEN_CALLED",
          relatedEntityId: candidate.id,
          relatedEntityType: "TOKEN",
          isRead: false,
          priority: "URGENT",
          createdAt: now,
        });
      }

      writeLocalDb(local);

      if (isSupabaseConfigured()) {
        const client = getSupabaseServerClient();
        if (client) {
          try {
            const { error } = await client
              .from("tokens")
              .update({
                status: "CALLED",
                called_at: now,
                doctor_id: assignedDoctorId,
                doctor_name: assignedDoctorName,
                room_number: assignedRoom,
              })
              .eq("id", candidate.id);
            if (error) {
              console.error("[Supabase Sync] callNextWaitingToken error:", error.message);
            }
          } catch (err) {
            console.error("[Supabase Sync] callNextWaitingToken exception:", (err as Error).message);
          }
        }
      }

      return local.tokens[idx];
    });
  },

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseServerClient();
      if (client) {
        try {
          const { data, error } = await client
            .from("appointments")
            .select("*")
            .order("date", { ascending: false });
          if (!error && data) {
            return data.map((a: any) => ({
              id: String(a.id),
              patientId: String(a.patient_id),
              patientName: a.patient_name,
              patientPhone: a.patient_phone,
              patientEmail: a.patient_email,
              doctorId: String(a.doctor_id),
              doctorName: a.doctor_name,
              departmentId: String(a.department_id),
              departmentName: a.department_name,
              date: a.date,
              timeSlot: a.time_slot,
              reason: a.reason,
              status: a.status,
              tokenId: a.token_id ? String(a.token_id) : undefined,
              createdAt: a.created_at,
            }));
          }
        } catch {
          // ignore
        }
      }
    }
    return readLocalDb().appointments;
  },

  async createAppointment(appointment: Appointment): Promise<Appointment> {
    if (!appointment.id) {
      appointment.id = randomUUID();
    }
    appointment.status = appointment.status || "CONFIRMED";
    const local = readLocalDb();

    // 1. Verify doctor availability
    const doctor = local.doctors.find((d) => d.id === appointment.doctorId);
    if (doctor && doctor.status === "INACTIVE") {
      throw new Error(`Dr. ${doctor.name} is currently inactive and not accepting new appointments.`);
    }

    // 2. Prevent double-booking for the exact same doctor, date, and timeslot
    const normalizedSlot = appointment.timeSlot.trim().toLowerCase();
    const existingConflict = local.appointments.find(
      (a) =>
        a.doctorId === appointment.doctorId &&
        a.date === appointment.date &&
        a.timeSlot.trim().toLowerCase() === normalizedSlot &&
        (a.status === "CONFIRMED" || a.status === "CHECKED_IN")
    );
    if (existingConflict) {
      throw new Error(
        `Appointment slot conflict: Dr. ${appointment.doctorName} is already booked on ${appointment.date} at ${appointment.timeSlot}. Please select a different time slot.`
      );
    }

    // 3. Fair load-aware capacity check
    const bookedToday = local.appointments.filter(
      (a) =>
        a.doctorId === appointment.doctorId &&
        a.date === appointment.date &&
        (a.status === "CONFIRMED" || a.status === "CHECKED_IN")
    ).length;
    const maxCapacity = doctor?.appointmentCapacityPerDay || 40;
    if (bookedToday >= maxCapacity) {
      throw new Error(
        `Dr. ${appointment.doctorName} has reached their daily booking capacity limit (${maxCapacity} patients) for ${appointment.date}. Please pick another date or consult another available specialist.`
      );
    }

    // 4. Server-validated consultation fee
    if (doctor?.consultationFee) {
      appointment.consultationFee = doctor.consultationFee;
    }

    if (!appointment.hospitalId) {
      appointment.hospitalId = doctor?.hospitalId || "hosp-queueless-blr";
    }

    local.appointments.unshift(appointment);

    // In-app notification for patient
    if (appointment.patientId) {
      local.notifications.unshift({
        id: randomUUID(),
        recipientId: appointment.patientId,
        recipientRole: "patient",
        hospitalId: appointment.hospitalId,
        title: "Appointment Confirmed",
        message: `Your appointment with Dr. ${appointment.doctorName} (${appointment.departmentName}) is confirmed for ${appointment.date} at ${appointment.timeSlot}.`,
        type: "APPOINTMENT_REMINDER",
        relatedEntityId: appointment.id,
        relatedEntityType: "APPOINTMENT",
        isRead: false,
        priority: "NORMAL",
        createdAt: new Date().toISOString(),
      });
    }

    writeLocalDb(local);

    if (isSupabaseConfigured()) {
      const client = getSupabaseServerClient();
      if (client) {
        try {
          await client.from("appointments").insert({
            id: appointment.id,
            patient_id: appointment.patientId,
            patient_name: appointment.patientName,
            patient_phone: appointment.patientPhone,
            patient_email: appointment.patientEmail,
            doctor_id: appointment.doctorId,
            doctor_name: appointment.doctorName,
            department_id: appointment.departmentId,
            department_name: appointment.departmentName,
            date: appointment.date,
            time_slot: appointment.timeSlot,
            reason: appointment.reason,
            status: appointment.status,
            token_id: appointment.tokenId,
          });
        } catch {
          // ignore
        }
      }
    }

    return appointment;
  },

  async updateAppointmentStatus(
    id: string,
    status: Appointment["status"],
    tokenId?: string
  ): Promise<Appointment | null> {
    const local = readLocalDb();
    const idx = local.appointments.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    local.appointments[idx].status = status;
    if (tokenId) local.appointments[idx].tokenId = tokenId;
    writeLocalDb(local);
    return local.appointments[idx];
  },

  // Visits
  async getVisits(): Promise<Visit[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseServerClient();
      if (client) {
        try {
          const { data, error } = await client
            .from("visits")
            .select("*")
            .order("created_at", { ascending: false });
          if (!error && data) {
            return data.map((v: any) => ({
              id: String(v.id),
              visitNumber: v.visit_number,
              tokenId: String(v.token_id),
              tokenNumber: v.token_number,
              patientId: String(v.patient_id),
              patientName: v.patient_name,
              patientAge: v.patient_age ? Number(v.patient_age) : undefined,
              patientGender: v.patient_gender,
              uhid: v.uhid,
              doctorId: String(v.doctor_id),
              doctorName: v.doctor_name,
              departmentName: v.department_name,
              roomNumber: v.room_number,
              visitDate: v.visit_date,
              checkInTimestamp: v.check_in_timestamp,
              consultationTimestamp: v.consultation_timestamp,
              checkoutTimestamp: v.checkout_timestamp,
              symptoms: v.symptoms,
              diagnosis: v.diagnosis,
              vitals: v.vitals || {},
              prescriptions: v.prescriptions || [],
              doctorAdvice: v.doctor_advice,
              followUpDate: v.follow_up_date,
              billingStatus: v.billing_status,
              billingAmount: Number(v.billing_amount),
              status: v.status,
            }));
          }
        } catch {
          // ignore
        }
      }
    }
    return readLocalDb().visits;
  },

  async getVisitById(id: string): Promise<Visit | null> {
    const visits = await db.getVisits();
    return visits.find((v) => v.id === id || v.visitNumber === id) || null;
  },

  async createVisit(visit: Visit): Promise<Visit> {
    if (!visit.id) {
      visit.id = randomUUID();
    }
    const local = readLocalDb();
    local.visits.unshift(visit);
    writeLocalDb(local);

    if (isSupabaseConfigured()) {
      const client = getSupabaseServerClient();
      if (client) {
        try {
          await client.from("visits").insert({
            id: visit.id,
            visit_number: visit.visitNumber,
            token_id: visit.tokenId,
            token_number: visit.tokenNumber,
            patient_id: visit.patientId,
            patient_name: visit.patientName,
            patient_age: visit.patientAge,
            patient_gender: visit.patientGender,
            uhid: visit.uhid,
            doctor_id: visit.doctorId,
            doctor_name: visit.doctorName,
            department_name: visit.departmentName,
            room_number: visit.roomNumber,
            visit_date: visit.visitDate,
            check_in_timestamp: visit.checkInTimestamp,
            consultation_timestamp: visit.consultationTimestamp,
            checkout_timestamp: visit.checkoutTimestamp,
            symptoms: visit.symptoms,
            diagnosis: visit.diagnosis,
            vitals: visit.vitals,
            prescriptions: visit.prescriptions,
            doctor_advice: visit.doctorAdvice,
            follow_up_date: visit.followUpDate,
            billing_status: visit.billingStatus,
            billing_amount: visit.billingAmount,
            status: visit.status,
          });
        } catch {
          // ignore
        }
      }
    }
    return visit;
  },

  // Emergency Cases
  async getEmergencyCases(): Promise<EmergencyCase[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseServerClient();
      if (client) {
        try {
          const { data, error } = await client
            .from("emergency_cases")
            .select("*")
            .order("registered_at", { ascending: false });
          if (!error && data) {
            return data.map((e: any) => ({
              id: String(e.id),
              tokenNumber: e.token_number,
              patientName: e.patient_name,
              approxAge: e.approx_age ? Number(e.approx_age) : undefined,
              gender: e.gender,
              triageLevel: e.triage_level,
              chiefComplaint: e.chief_complaint,
              consciousness: e.consciousness,
              arrivalType: e.arrival_type,
              contactPerson: e.contact_person,
              contactPhone: e.contact_phone,
              assignedBay: e.assigned_bay,
              doctorName: e.doctor_name,
              status: e.status,
              registeredAt: e.registered_at,
            }));
          }
        } catch {
          // ignore
        }
      }
    }
    return readLocalDb().emergencyCases;
  },

  async createEmergencyCase(caseData: EmergencyCase): Promise<EmergencyCase> {
    if (!caseData.id) {
      caseData.id = randomUUID();
    }
    const local = readLocalDb();
    local.emergencyCases.unshift(caseData);

    // In-app emergency alert for all clinical staff
    local.notifications.unshift({
      id: randomUUID(),
      recipientId: "all-clinical-staff",
      recipientRole: "staff",
      hospitalId: caseData.hospitalId || "hosp-queueless-blr",
      title: `🚨 Emergency Intake: ${caseData.patientName}`,
      message: `Severity: ${caseData.triageLevel}. Assigned Bay: ${caseData.assignedBay}. Chief complaint: ${caseData.chiefComplaint}`,
      type: "EMERGENCY_ALERT",
      relatedEntityId: caseData.id,
      relatedEntityType: "EMERGENCY",
      isRead: false,
      priority: "URGENT",
      createdAt: caseData.registeredAt,
    });

    writeLocalDb(local);

    if (isSupabaseConfigured()) {
      const client = getSupabaseServerClient();
      if (client) {
        try {
          await client.from("emergency_cases").insert({
            id: caseData.id,
            token_number: caseData.tokenNumber,
            patient_name: caseData.patientName,
            approx_age: caseData.approxAge,
            gender: caseData.gender,
            triage_level: caseData.triageLevel,
            chief_complaint: caseData.chiefComplaint,
            consciousness: caseData.consciousness,
            arrival_type: caseData.arrivalType,
            contact_person: caseData.contactPerson,
            contact_phone: caseData.contactPhone,
            assigned_bay: caseData.assignedBay,
            doctor_name: caseData.doctorName,
            status: caseData.status,
            registered_at: caseData.registeredAt,
          });
        } catch {
          // ignore
        }
      }
    }
    return caseData;
  },

  // ---------------------------------------------------------------------------
  // Comprehensive Itemized Billing System (in INR ₹)
  // ---------------------------------------------------------------------------
  async getBills(filters?: { patientId?: string; hospitalId?: string; visitId?: string }): Promise<Bill[]> {
    const local = readLocalDb();
    let result = local.bills;
    if (filters?.patientId) {
      result = result.filter((b) => b.patientId === filters.patientId);
    }
    if (filters?.hospitalId) {
      result = result.filter((b) => b.hospitalId === filters.hospitalId);
    }
    if (filters?.visitId) {
      result = result.filter((b) => b.visitId === filters.visitId);
    }
    return result;
  },

  async getBillById(id: string): Promise<Bill | null> {
    const bills = await db.getBills();
    return bills.find((b) => b.id === id || b.billNumber.toLowerCase() === id.toLowerCase()) || null;
  },

  async createBill(
    billData: Partial<Bill> & {
      patientId: string;
      patientName: string;
      uhid: string;
      items: BillItem[];
    }
  ): Promise<Bill> {
    const local = readLocalDb();
    const id = billData.id || randomUUID();
    const billNumber =
      billData.billNumber ||
      `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    // Server-side recalculation of item line totals
    const validatedItems: BillItem[] = (billData.items || []).map((item, idx) => {
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const price = Math.max(0, Math.round((Number(item.unitPrice) || 0) * 100) / 100);
      return {
        id: item.id || `bi-${idx + 1}-${randomUUID().slice(0, 6)}`,
        billId: id,
        category: item.category || "OTHER",
        itemDescription: item.itemDescription,
        itemCode: item.itemCode,
        quantity: qty,
        unitPrice: price,
        totalPrice: Math.round(qty * price * 100) / 100,
      };
    });

    const subtotal = Math.round(validatedItems.reduce((acc, it) => acc + it.totalPrice, 0) * 100) / 100;
    const rawDiscount = Math.max(0, Math.round((Number(billData.discountAmount) || 0) * 100) / 100);
    const discountAmount = Math.min(subtotal, rawDiscount);
    const taxAmount = Math.max(0, Math.round((Number(billData.taxAmount) || 0) * 100) / 100);
    const totalPayable = Math.round((subtotal - discountAmount + taxAmount) * 100) / 100;
    const amountPaid = Math.max(0, Math.round((Number(billData.amountPaid) || 0) * 100) / 100);
    const balanceDue = Math.max(0, Math.round((totalPayable - amountPaid) * 100) / 100);

    let paymentStatus: Bill["paymentStatus"] = "PENDING";
    if (balanceDue === 0 && totalPayable > 0) {
      paymentStatus = "PAID";
    } else if (amountPaid > 0 && balanceDue > 0) {
      paymentStatus = "PARTIAL";
    }

    const newBill: Bill = {
      id,
      billNumber,
      hospitalId: billData.hospitalId || "hosp-queueless-blr",
      hospitalName: billData.hospitalName || "QueueLess AI Smart Hospital",
      hospitalAddress:
        billData.hospitalAddress ||
        "450 9th Main Road, Jayanagar 4th Block, Bengaluru, Karnataka 560011",
      patientId: billData.patientId,
      patientName: billData.patientName,
      uhid: billData.uhid,
      visitId: billData.visitId,
      visitNumber: billData.visitNumber,
      tokenId: billData.tokenId,
      tokenNumber: billData.tokenNumber,
      departmentName: billData.departmentName || "General Medicine",
      attendingDoctorName: billData.attendingDoctorName || "Attending Physician",
      billDate: billData.billDate || now.split("T")[0],
      items: validatedItems,
      subtotal,
      discountAmount,
      discountReason: billData.discountReason,
      authorizedBy: billData.authorizedBy,
      taxAmount,
      totalPayable,
      totalAmount: totalPayable,
      amountPaid,
      balanceDue,
      currency: "INR",
      paymentStatus: billData.paymentStatus || paymentStatus,
      status: billData.paymentStatus || paymentStatus,
      paymentMethod: billData.paymentMethod,
      paymentReference: billData.paymentReference,
      paidAt: billData.paidAt || (paymentStatus === "PAID" ? now : undefined),
      isImmutable: Boolean(billData.isImmutable),
      adjustmentNotes: billData.adjustmentNotes,
      createdAt: billData.createdAt || now,
      updatedAt: now,
    };

    local.bills.unshift(newBill);

    // In-app notification for patient
    if (newBill.patientId) {
      local.notifications.unshift({
        id: randomUUID(),
        recipientId: newBill.patientId,
        recipientRole: "patient",
        hospitalId: newBill.hospitalId,
        title: `Medical Bill Generated (${newBill.billNumber})`,
        message: `Encounter invoice of ₹${newBill.totalPayable.toLocaleString(
          "en-IN"
        )} is ready. Balance due: ₹${newBill.balanceDue.toLocaleString("en-IN")}.`,
        type: "BILL_GENERATED",
        relatedEntityId: newBill.id,
        relatedEntityType: "BILL",
        isRead: false,
        priority: "NORMAL",
        createdAt: now,
      });
    }

    writeLocalDb(local);
    return newBill;
  },

  async recordBillPayment(
    billId: string,
    payment:
      | number
      | {
          amount: number;
          paymentMethod?: "CASH" | "UPI" | "CARD" | "INSURANCE" | "NET_BANKING";
          paymentReference?: string;
          notes?: string;
        }
  ): Promise<Bill> {
    const paymentAmount = typeof payment === "number" ? payment : payment.amount;
    const paymentMethod = typeof payment === "number" ? "CASH" : (payment.paymentMethod || "CASH");
    const paymentReference = typeof payment === "number" ? undefined : payment.paymentReference;
    const paymentNotes = typeof payment === "number" ? undefined : payment.notes;

    const local = readLocalDb();
    const billIndex = local.bills.findIndex((b) => b.id === billId || b.billNumber === billId);
    if (billIndex === -1) {
      throw new Error(`Bill not found with ID ${billId}`);
    }
    const bill = local.bills[billIndex];
    const newAmountPaid = Math.round(((bill.amountPaid || 0) + paymentAmount) * 100) / 100;
    const totalDue = bill.totalPayable ?? (bill as any).totalAmount ?? 0;
    const newBalance = Math.max(0, Math.round((totalDue - newAmountPaid) * 100) / 100);

    bill.amountPaid = newAmountPaid;
    bill.balanceDue = newBalance;
    bill.paymentMethod = paymentMethod;
    if (paymentReference) bill.paymentReference = paymentReference;
    bill.paymentStatus = newBalance === 0 ? "PAID" : "PARTIAL";
    (bill as any).status = bill.paymentStatus;
    (bill as any).totalAmount = totalDue;
    bill.paidAt = new Date().toISOString();
    bill.updatedAt = new Date().toISOString();
    if (paymentNotes) {
      bill.adjustmentNotes = (bill.adjustmentNotes ? bill.adjustmentNotes + "; " : "") + paymentNotes;
    }

    writeLocalDb(local);
    return bill;
  },

  // ---------------------------------------------------------------------------
  // Surgical & Procedure Records
  // ---------------------------------------------------------------------------
  async getProcedures(filters?: {
    patientId?: string;
    hospitalId?: string;
    visitId?: string;
    surgeonId?: string;
  }): Promise<ProcedureRecord[]> {
    const local = readLocalDb();
    let result = local.procedures;
    if (filters?.patientId) result = result.filter((p) => p.patientId === filters.patientId);
    if (filters?.hospitalId) result = result.filter((p) => p.hospitalId === filters.hospitalId);
    if (filters?.visitId) result = result.filter((p) => p.visitId === filters.visitId);
    if (filters?.surgeonId) result = result.filter((p) => p.surgeonId === filters.surgeonId);
    return result;
  },

  async getProcedureById(id: string): Promise<ProcedureRecord | null> {
    const procs = await db.getProcedures();
    return procs.find((p) => p.id === id || p.procedureNumber.toLowerCase() === id.toLowerCase()) || null;
  },

  async createProcedure(
    procData: Partial<ProcedureRecord> & {
      patientId: string;
      patientName: string;
      uhid: string;
      procedureName: string;
      leadSurgeonName: string;
      departmentName: string;
      operatingRoom: string;
    }
  ): Promise<ProcedureRecord> {
    const local = readLocalDb();
    const id = procData.id || randomUUID();
    const procedureNumber =
      procData.procedureNumber ||
      `PRC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const newProc: ProcedureRecord = {
      id,
      procedureNumber,
      hospitalId: procData.hospitalId || "hosp-queueless-blr",
      patientId: procData.patientId,
      patientName: procData.patientName,
      uhid: procData.uhid,
      visitId: procData.visitId,
      procedureName: procData.procedureName,
      procedureCode: procData.procedureCode || "CPT-GEN",
      indication: procData.indication || "Clinical indication documented",
      preoperativeAssessment: procData.preoperativeAssessment || "Pre-op checklist verified, ASA grade noted",
      consentObtained: Boolean(procData.consentObtained),
      consentDocumentRef: procData.consentDocumentRef,
      leadSurgeonName: procData.leadSurgeonName,
      surgeonId: procData.surgeonId,
      surgicalTeam: procData.surgicalTeam || [procData.leadSurgeonName],
      departmentName: procData.departmentName,
      operatingRoom: procData.operatingRoom,
      procedureDate: procData.procedureDate || now.split("T")[0],
      startTime: procData.startTime || "10:00",
      endTime: procData.endTime || "11:00",
      anesthesiaType: procData.anesthesiaType || "LOCAL",
      anesthesiologistName: procData.anesthesiologistName,
      operativeFindings: procData.operativeFindings || "Operative findings documented by surgeon",
      procedureNotes: procData.procedureNotes || "Standard procedure executed without deviation",
      complications: procData.complications || "None reported",
      postoperativeCondition: procData.postoperativeCondition || "Stable in recovery room",
      carePlan: procData.carePlan || "Post-op analgesia, wound monitoring",
      followUpInstructions: procData.followUpInstructions || "Follow up in 7 days for inspection",
      status: procData.status || "COMPLETED",
      isVerified: Boolean(procData.isVerified),
      verifiedByDoctorId: procData.verifiedByDoctorId,
      verifiedByDoctorName: procData.verifiedByDoctorName,
      verifiedAt: procData.verifiedAt,
      relatedBillId: procData.relatedBillId,
      procedureFee: Number(procData.procedureFee) || 1500,
      createdAt: procData.createdAt || now,
      updatedAt: now,
    };

    local.procedures.unshift(newProc);
    writeLocalDb(local);
    return newProc;
  },

  async verifyProcedure(id: string, doctorId: string, doctorName: string): Promise<ProcedureRecord> {
    const local = readLocalDb();
    const idx = local.procedures.findIndex((p) => p.id === id || p.procedureNumber === id);
    if (idx === -1) throw new Error(`Procedure ${id} not found`);
    const now = new Date().toISOString();
    local.procedures[idx].isVerified = true;
    local.procedures[idx].status = "VERIFIED";
    local.procedures[idx].verifiedByDoctorId = doctorId;
    local.procedures[idx].verifiedByDoctorName = doctorName;
    local.procedures[idx].verifiedAt = now;
    local.procedures[idx].updatedAt = now;
    writeLocalDb(local);
    return local.procedures[idx];
  },

  // ---------------------------------------------------------------------------
  // AI-Assisted Clinical Support (Clinician-in-the-Loop)
  // ---------------------------------------------------------------------------
  async getAiClinicalSuggestions(filters?: {
    visitId?: string;
    patientId?: string;
    doctorId?: string;
  }): Promise<AiClinicalSuggestion[]> {
    const local = readLocalDb();
    let result = local.aiSuggestions;
    if (filters?.visitId) result = result.filter((s) => s.visitId === filters.visitId);
    if (filters?.patientId) result = result.filter((s) => s.patientId === filters.patientId);
    if (filters?.doctorId) result = result.filter((s) => s.doctorId === filters.doctorId);
    return result;
  },

  async getAiClinicalSuggestionById(id: string): Promise<AiClinicalSuggestion | null> {
    const local = readLocalDb();
    return local.aiSuggestions.find((s) => s.id === id) || null;
  },

  async createAiClinicalSuggestion(suggestion: AiClinicalSuggestion): Promise<AiClinicalSuggestion> {
    if (!suggestion.id) suggestion.id = randomUUID();
    const local = readLocalDb();
    local.aiSuggestions.unshift(suggestion);
    writeLocalDb(local);
    return suggestion;
  },

  async updateAiClinicalSuggestionStatus(
    id: string,
    status: AiClinicalSuggestion["status"],
    clinicianEdits?: string,
    approvedByDoctorName?: string
  ): Promise<AiClinicalSuggestion | null> {
    const local = readLocalDb();
    const idx = local.aiSuggestions.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    local.aiSuggestions[idx].status = status;
    if (clinicianEdits !== undefined) local.aiSuggestions[idx].clinicianEdits = clinicianEdits;
    if (approvedByDoctorName) local.aiSuggestions[idx].approvedByDoctorName = approvedByDoctorName;
    if (status === "CLINICIAN_APPROVED") local.aiSuggestions[idx].approvedAt = new Date().toISOString();
    writeLocalDb(local);
    return local.aiSuggestions[idx];
  },

  // ---------------------------------------------------------------------------
  // In-App Notification System
  // ---------------------------------------------------------------------------
  async getNotifications(userId: string, role?: UserRole): Promise<AppNotification[]> {
    const local = readLocalDb();
    return local.notifications.filter(
      (n) =>
        n.recipientId === userId ||
        (n.recipientRole === role && n.recipientId === "all-clinical-staff")
    );
  },

  async createNotification(notification: AppNotification): Promise<AppNotification> {
    if (!notification.id) notification.id = randomUUID();
    const local = readLocalDb();
    local.notifications.unshift(notification);
    if (local.notifications.length > 500) {
      local.notifications = local.notifications.slice(0, 500);
    }
    writeLocalDb(local);
    return notification;
  },

  async markNotificationAsRead(id: string): Promise<AppNotification | null> {
    const local = readLocalDb();
    const idx = local.notifications.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    local.notifications[idx].isRead = true;
    local.notifications[idx].readAt = new Date().toISOString();
    writeLocalDb(local);
    return local.notifications[idx];
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const local = readLocalDb();
    return local.auditLogs;
  },

  async createAuditLog(log: AuditLog): Promise<AuditLog> {
    if (!log.id) {
      log.id = randomUUID();
    }
    const local = readLocalDb();
    local.auditLogs.unshift(log);
    if (local.auditLogs.length > 500) {
      local.auditLogs = local.auditLogs.slice(0, 500);
    }
    writeLocalDb(local);
    return log;
  },

  // Hospital Settings
  async getSettings(): Promise<HospitalSettings> {
    return readLocalDb().settings;
  },

  async updateSettings(settings: Partial<HospitalSettings>): Promise<HospitalSettings> {
    const local = readLocalDb();
    local.settings = { ...local.settings, ...settings };
    writeLocalDb(local);
    return local.settings;
  },

  // Aggregated Dashboard Analytics
  async getDashboardStats() {
    const tokens = await db.getTokens();
    const doctors = await db.getDoctors();
    const today = new Date().toISOString().split("T")[0];

    const todayTokens = tokens.filter(
      (t) =>
        t.generatedAt.startsWith(today) ||
        t.status === "WAITING" ||
        t.status === "CHECKED_IN" ||
        t.status === "CALLED" ||
        t.status === "IN_CONSULTATION"
    );
    const waitingTokens = tokens.filter((t) => t.status === "WAITING" || t.status === "CHECKED_IN");
    const activeConsultations = tokens.filter((t) => t.status === "IN_CONSULTATION");
    const calledTokens = tokens.filter((t) => t.status === "CALLED");
    const completedTokens = tokens.filter((t) => t.status === "COMPLETED");
    const emergencyTokens = tokens.filter((t) => t.isEmergency || t.priority === "EMERGENCY");

    const totalWaitSum = waitingTokens.reduce((acc, t) => acc + (t.estimatedWaitMinutes || 10), 0);
    const avgWaitMinutes = waitingTokens.length > 0 ? Math.round(totalWaitSum / waitingTokens.length) : 8;

    return {
      totalPatientsToday: todayTokens.length,
      activeQueueCount: waitingTokens.length,
      currentlyServingCount: activeConsultations.length + calledTokens.length,
      completedConsultationsCount: completedTokens.length,
      emergencyCasesCount: emergencyTokens.length,
      avgWaitMinutes,
      activeDoctorsCount: doctors.filter((d) => d.isAvailableToday).length,
    };
  },
};
