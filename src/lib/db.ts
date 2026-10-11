import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import {
  UserProfile,
  Department,
  Doctor,
  Appointment,
  Token,
  Visit,
  EmergencyCase,
  AuditLog,
  HospitalSettings,
  TokenStatus,
  TokenPriority,
} from "./types";
import { getSupabaseServerClient, isSupabaseConfigured } from "./supabase";
import { calculateWaitTime } from "./utils";

// Local filesystem paths
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const TMP_DIR = path.join("/tmp", "queueless-data");
const TMP_DB_FILE = path.join(TMP_DIR, "db.json");

interface DatabaseState {
  profiles: UserProfile[];
  departments: Department[];
  doctors: Doctor[];
  appointments: Appointment[];
  tokens: Token[];
  visits: Visit[];
  emergencyCases: EmergencyCase[];
  auditLogs: AuditLog[];
  settings: HospitalSettings;
}

const INITIAL_STATE: DatabaseState = {
  settings: {
    hospitalName: "QueueLess AI Smart Hospital",
    tagline: "Next-Gen Digital Token & Intelligent OPD Flow",
    contactPhone: "+1 (800) 555-QUEUE",
    emergencyHotline: "+1 (800) 911-HELP",
    address: "450 Healthcare Boulevard, Suite 100, Metro City",
    opdStartTime: "08:00 AM",
    opdEndTime: "06:00 PM",
    defaultAvgConsultationMins: 12,
    autoCallNextEnabled: true,
    smsNotificationEnabled: true,
    maxTokensPerDoctorDay: 40,
  },
  departments: [
    {
      id: "dept-gen",
      name: "General Medicine",
      code: "GEN",
      floor: "Ground Floor (Wing A)",
      description: "Primary healthcare, acute illness, viral fever, preventive wellness",
      avgConsultationMinutes: 10,
      activeDoctorsCount: 4,
      iconName: "Activity",
    },
    {
      id: "dept-car",
      name: "Cardiology",
      code: "CAR",
      floor: "2nd Floor (Wing B)",
      description: "Heart diagnostics, hypertension, ECG, cardiovascular care",
      avgConsultationMinutes: 15,
      activeDoctorsCount: 3,
      iconName: "Heart",
    },
    {
      id: "dept-ped",
      name: "Pediatrics",
      code: "PED",
      floor: "1st Floor (Wing C)",
      description: "Child health, immunization, pediatric infections & development",
      avgConsultationMinutes: 12,
      activeDoctorsCount: 3,
      iconName: "Baby",
    },
    {
      id: "dept-ort",
      name: "Orthopedics",
      code: "ORT",
      floor: "Ground Floor (Wing B)",
      description: "Bones, joints, sports injury, arthroscopy & fracture care",
      avgConsultationMinutes: 15,
      activeDoctorsCount: 2,
      iconName: "Bone",
    },
    {
      id: "dept-neu",
      name: "Neurology",
      code: "NEU",
      floor: "3rd Floor (Wing A)",
      description: "Brain & nervous system disorders, migraines, stroke rehabilitation",
      avgConsultationMinutes: 20,
      activeDoctorsCount: 2,
      iconName: "Brain",
    },
    {
      id: "dept-emg",
      name: "Emergency & Trauma",
      code: "EMG",
      floor: "Ground Floor (ER Bay)",
      description: "24/7 Acute trauma, resuscitation, cardiac arrest & triage bay",
      avgConsultationMinutes: 5,
      activeDoctorsCount: 5,
      iconName: "AlertTriangle",
    },
  ],
  doctors: [
    {
      id: "doc-1",
      name: "Dr. Sarah Mitchell, MD",
      departmentId: "dept-gen",
      departmentName: "General Medicine",
      specialization: "Internal Medicine Specialist",
      roomNumber: "Room 101",
      consultationFee: 500,
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      isAvailableToday: true,
    },
    {
      id: "doc-2",
      name: "Dr. Arjun Mehta, DM",
      departmentId: "dept-car",
      departmentName: "Cardiology",
      specialization: "Senior Interventional Cardiologist",
      roomNumber: "Room 204",
      consultationFee: 800,
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      isAvailableToday: true,
    },
    {
      id: "doc-3",
      name: "Dr. Emily Chen, MD",
      departmentId: "dept-ped",
      departmentName: "Pediatrics",
      specialization: "Chief Pediatrician & Neonatologist",
      roomNumber: "Room 112",
      consultationFee: 600,
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      isAvailableToday: true,
    },
    {
      id: "doc-4",
      name: "Dr. Marcus Reynolds, MS",
      departmentId: "dept-ort",
      departmentName: "Orthopedics",
      specialization: "Orthopedic Surgeon & Joint Replacement",
      roomNumber: "Room 108",
      consultationFee: 750,
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      isAvailableToday: true,
    },
    {
      id: "doc-5",
      name: "Dr. Priya Sharma, DM",
      departmentId: "dept-neu",
      departmentName: "Neurology",
      specialization: "Neurologist & Epilepsy Consultant",
      roomNumber: "Room 302",
      consultationFee: 900,
      availableDays: ["Tuesday", "Thursday", "Friday"],
      isAvailableToday: true,
    },
    {
      id: "doc-6",
      name: "Dr. David Vance, MD",
      departmentId: "dept-emg",
      departmentName: "Emergency & Trauma",
      specialization: "Emergency Medicine Director",
      roomNumber: "ER Bay 1",
      consultationFee: 0,
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      isAvailableToday: true,
    },
  ],
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

function readLocalDb(): DatabaseState {
  if (inMemoryState) {
    return inMemoryState;
  }
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw) as DatabaseState;
      if (parsed && Array.isArray(parsed.tokens)) {
        inMemoryState = parsed;
        return parsed;
      }
    }

    if (fs.existsSync(TMP_DB_FILE)) {
      try {
        const rawTmp = fs.readFileSync(TMP_DB_FILE, "utf-8");
        const parsedTmp = JSON.parse(rawTmp) as DatabaseState;
        if (parsedTmp && Array.isArray(parsedTmp.tokens)) {
          inMemoryState = parsedTmp;
          return parsedTmp;
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
              name: d.name,
              code: d.code,
              floor: d.floor,
              description: d.description,
              avgConsultationMinutes: d.avg_consultation_minutes || 12,
              activeDoctorsCount: d.active_doctors_count || 1,
              iconName: d.icon_name || "Activity",
            }));
          } else {
            // Seed departments if Supabase is empty
            const localDepts = readLocalDb().departments;
            for (const d of localDepts) {
              await client.from("departments").insert({
                id: d.id,
                name: d.name,
                code: d.code,
                floor: d.floor,
                description: d.description,
                avg_consultation_minutes: d.avgConsultationMinutes,
                active_doctors_count: d.activeDoctorsCount,
                icon_name: d.iconName,
              });
            }
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
              name: d.name,
              departmentId: String(d.department_id),
              departmentName: d.department_name,
              specialization: d.specialization,
              roomNumber: d.room_number,
              consultationFee: Number(d.consultation_fee) || 500,
              availableDays: d.available_days || [],
              isAvailableToday: Boolean(d.is_available_today),
              avatarUrl: d.avatar_url,
            }));
          } else {
            // Seed doctors if Supabase is empty
            const localDocs = readLocalDb().doctors;
            for (const doc of localDocs) {
              await client.from("doctors").insert({
                id: doc.id,
                name: doc.name,
                department_id: doc.departmentId,
                department_name: doc.departmentName,
                specialization: doc.specialization,
                room_number: doc.roomNumber,
                consultation_fee: doc.consultationFee,
                available_days: doc.availableDays,
                is_available_today: doc.isAvailableToday,
              });
            }
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
    const local = readLocalDb();
    local.appointments.unshift(appointment);
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
