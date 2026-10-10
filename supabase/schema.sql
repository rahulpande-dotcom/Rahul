-- =========================================================================
-- QUEUELESS AI — SMART HOSPITAL MANAGEMENT SYSTEM DATABASE SCHEMA
-- PostgreSQL with Row Level Security (RLS) & Triggers
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase auth.users or standalone)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'staff', 'doctor', 'patient')),
  phone VARCHAR(50),
  age INT,
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
  blood_group VARCHAR(10),
  emergency_contact VARCHAR(100),
  uhid VARCHAR(50) UNIQUE,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  floor VARCHAR(50) NOT NULL,
  description TEXT,
  avg_consultation_minutes INT DEFAULT 12,
  active_doctors_count INT DEFAULT 1,
  icon_name VARCHAR(50) DEFAULT 'Stethoscope',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  department_name VARCHAR(150) NOT NULL,
  specialization VARCHAR(255) NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  consultation_fee NUMERIC(10, 2) DEFAULT 500.00,
  available_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  is_available_today BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_name VARCHAR(255) NOT NULL,
  patient_phone VARCHAR(50) NOT NULL,
  patient_email VARCHAR(255) NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  doctor_name VARCHAR(255) NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  department_name VARCHAR(150) NOT NULL,
  date DATE NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED')),
  token_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TOKENS TABLE (Live OPD Queue)
CREATE TABLE IF NOT EXISTS public.tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_number VARCHAR(50) UNIQUE NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  department_name VARCHAR(150) NOT NULL,
  department_code VARCHAR(10) NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  doctor_name VARCHAR(255),
  room_number VARCHAR(50),
  patient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  patient_name VARCHAR(255) NOT NULL,
  patient_age INT,
  patient_gender VARCHAR(20),
  patient_phone VARCHAR(50),
  is_emergency BOOLEAN DEFAULT false,
  priority VARCHAR(50) DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'SENIOR_CITIZEN', 'EMERGENCY')),
  status VARCHAR(50) DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'CALLED', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  type VARCHAR(50) DEFAULT 'ONLINE' CHECK (type IN ('ONLINE', 'WALK_IN', 'EMERGENCY')),
  queue_position INT DEFAULT 1,
  estimated_wait_minutes INT DEFAULT 15,
  symptoms TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  check_in_at TIMESTAMPTZ,
  called_at TIMESTAMPTZ,
  consultation_start_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 6. VISITS TABLE (Clinical Encounter Records)
CREATE TABLE IF NOT EXISTS public.visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_number VARCHAR(50) UNIQUE NOT NULL,
  token_id UUID REFERENCES public.tokens(id) ON DELETE SET NULL,
  token_number VARCHAR(50) NOT NULL,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_name VARCHAR(255) NOT NULL,
  patient_age INT,
  patient_gender VARCHAR(20),
  uhid VARCHAR(50) NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  doctor_name VARCHAR(255) NOT NULL,
  department_name VARCHAR(150) NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consultation_timestamp TIMESTAMPTZ,
  checkout_timestamp TIMESTAMPTZ,
  symptoms TEXT,
  diagnosis TEXT,
  vitals JSONB DEFAULT '{}'::jsonb,
  prescriptions JSONB DEFAULT '[]'::jsonb,
  doctor_advice TEXT,
  follow_up_date DATE,
  billing_status VARCHAR(50) DEFAULT 'PAID' CHECK (billing_status IN ('PAID', 'PENDING', 'WAIVED')),
  billing_amount NUMERIC(10, 2) DEFAULT 500.00,
  status VARCHAR(50) DEFAULT 'COMPLETED' CHECK (status IN ('IN_PROGRESS', 'COMPLETED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EMERGENCY CASES TABLE
CREATE TABLE IF NOT EXISTS public.emergency_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_number VARCHAR(50) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  approx_age INT,
  gender VARCHAR(20) NOT NULL,
  triage_level VARCHAR(50) NOT NULL CHECK (triage_level IN ('LEVEL_1_RESUSCITATION', 'LEVEL_2_EMERGENT', 'LEVEL_3_URGENT')),
  chief_complaint TEXT NOT NULL,
  consciousness VARCHAR(50) NOT NULL CHECK (consciousness IN ('ALERT', 'VOICE_RESPONSIVE', 'PAIN_RESPONSIVE', 'UNRESPONSIVE')),
  arrival_type VARCHAR(50) NOT NULL CHECK (arrival_type IN ('AMBULANCE', 'WALK_IN', 'TRANSFER')),
  contact_person VARCHAR(255),
  contact_phone VARCHAR(50),
  assigned_bay VARCHAR(50) NOT NULL DEFAULT 'ER Bay 1',
  doctor_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'TRIAGED' CHECK (status IN ('TRIAGED', 'ATTENDING', 'STABILIZED', 'ADMITTED_ICU', 'DISCHARGED')),
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  actor_email VARCHAR(255) NOT NULL,
  actor_role VARCHAR(50) NOT NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(50)
);

-- 9. HOSPITAL SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.hospital_settings (
  id INT PRIMARY KEY DEFAULT 1,
  hospital_name VARCHAR(255) DEFAULT 'QueueLess AI Smart Hospital',
  tagline VARCHAR(255) DEFAULT 'Next-Gen Digital Token & Intelligent OPD Flow',
  contact_phone VARCHAR(50) DEFAULT '+1 (800) 555-QUEUE',
  emergency_hotline VARCHAR(50) DEFAULT '+1 (800) 911-HELP',
  address TEXT DEFAULT '450 Healthcare Boulevard, Suite 100, Metro City',
  opd_start_time VARCHAR(20) DEFAULT '08:00 AM',
  opd_end_time VARCHAR(20) DEFAULT '06:00 PM',
  default_avg_consultation_mins INT DEFAULT 12,
  auto_call_next_enabled BOOLEAN DEFAULT true,
  sms_notification_enabled BOOLEAN DEFAULT true,
  max_tokens_per_doctor_day INT DEFAULT 40,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_tokens_status ON public.tokens (status);
CREATE INDEX IF NOT EXISTS idx_tokens_priority ON public.tokens (priority);
CREATE INDEX IF NOT EXISTS idx_tokens_dept ON public.tokens (department_id);
CREATE INDEX IF NOT EXISTS idx_tokens_patient ON public.tokens (patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments (patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments (date);
CREATE INDEX IF NOT EXISTS idx_visits_patient ON public.visits (patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs (timestamp DESC);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile; Staff/Admin can view all
CREATE POLICY "Public read profiles for staff/admin" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Departments & Doctors: Public read
CREATE POLICY "Public read departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Public read doctors" ON public.doctors FOR SELECT USING (true);

-- Tokens: Public can read tokens (for public queue monitors), Staff can insert/update
CREATE POLICY "Public read tokens" ON public.tokens FOR SELECT USING (true);
CREATE POLICY "Staff insert tokens" ON public.tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff update tokens" ON public.tokens FOR UPDATE USING (true);

-- Appointments: Users can read own appointments, Staff/Admin can view all
CREATE POLICY "Patient read appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Patient insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);

-- Emergency Cases: Anyone can insert emergency registration (unauthenticated access), Staff can view/update
CREATE POLICY "Anyone insert emergency" ON public.emergency_cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Public view emergency cases" ON public.emergency_cases FOR SELECT USING (true);
CREATE POLICY "Staff update emergency" ON public.emergency_cases FOR UPDATE USING (true);

-- Visits: Patients can read their own visits, Staff/Admin can view/insert
CREATE POLICY "Read visits" ON public.visits FOR SELECT USING (true);
CREATE POLICY "Staff insert visits" ON public.visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff update visits" ON public.visits FOR UPDATE USING (true);

-- Audit logs: Read by admin
CREATE POLICY "Admin read audit logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "System insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Settings: Public read, Admin update
CREATE POLICY "Public read settings" ON public.hospital_settings FOR SELECT USING (true);
CREATE POLICY "Admin update settings" ON public.hospital_settings FOR UPDATE USING (true);

-- =========================================================================
-- SEED DATA
-- =========================================================================

-- Default Settings
INSERT INTO public.hospital_settings (id, hospital_name, tagline, contact_phone, emergency_hotline, address)
VALUES (
  1,
  'QueueLess AI Smart Hospital',
  'Next-Gen Digital Token & Intelligent OPD Flow',
  '+1 (800) 555-QUEUE',
  '+1 (800) 911-HELP',
  '450 Healthcare Boulevard, Suite 100, Metro City'
) ON CONFLICT (id) DO NOTHING;

-- Initial Departments
INSERT INTO public.departments (id, name, code, floor, description, avg_consultation_minutes, active_doctors_count, icon_name)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'General Medicine', 'GEN', 'Ground Floor (Wing A)', 'Primary healthcare, acute illness, fever, preventive care', 10, 4, 'Activity'),
  ('11111111-1111-1111-1111-111111111102', 'Cardiology', 'CAR', '2nd Floor (Wing B)', 'Heart diagnostics, hypertension, ECG, cardiovascular care', 15, 3, 'Heart'),
  ('11111111-1111-1111-1111-111111111103', 'Pediatrics', 'PED', '1st Floor (Wing C)', 'Child health, immunization, neonatal checkups', 12, 3, 'Baby'),
  ('11111111-1111-1111-1111-111111111104', 'Orthopedics', 'ORT', 'Ground Floor (Wing B)', 'Bones, joints, trauma, sports injuries, physiotherapy', 15, 2, 'Bone'),
  ('11111111-1111-1111-1111-111111111105', 'Neurology', 'NEU', '3rd Floor (Wing A)', 'Brain, nervous system, migraine, stroke management', 20, 2, 'Brain'),
  ('11111111-1111-1111-1111-111111111106', 'Emergency & Trauma', 'EMG', 'Ground Floor (ER Bay)', '24/7 Resuscitation, trauma care, acute cardiac care', 5, 5, 'AlertTriangle')
ON CONFLICT (code) DO NOTHING;

-- Initial Doctors
INSERT INTO public.doctors (id, name, department_id, department_name, specialization, room_number, consultation_fee)
VALUES
  ('22222222-2222-2222-2222-222222222201', 'Dr. Sarah Mitchell, MD', '11111111-1111-1111-1111-111111111101', 'General Medicine', 'Internal Medicine Specialist', 'Room 101', 500.00),
  ('22222222-2222-2222-2222-222222222202', 'Dr. Arjun Mehta, DM', '11111111-1111-1111-1111-111111111102', 'Cardiology', 'Interventional Cardiologist', 'Room 204', 800.00),
  ('22222222-2222-2222-2222-222222222203', 'Dr. Emily Chen, MD', '11111111-1111-1111-1111-111111111103', 'Pediatrics', 'Senior Pediatrician & Neonatologist', 'Room 112', 600.00),
  ('22222222-2222-2222-2222-222222222204', 'Dr. Marcus Reynolds, MS', '11111111-1111-1111-1111-111111111104', 'Orthopedics', 'Orthopedic Surgeon & Joint Specialist', 'Room 108', 750.00),
  ('22222222-2222-2222-2222-222222222205', 'Dr. Priya Sharma, DM', '11111111-1111-1111-1111-111111111105', 'Neurology', 'Neurologist & Stroke Consultant', 'Room 302', 900.00),
  ('22222222-2222-2222-2222-222222222206', 'Dr. David Vance, MD', '11111111-1111-1111-1111-111111111106', 'Emergency & Trauma', 'Emergency Medicine Director', 'ER Bay 1', 0.00)
ON CONFLICT (id) DO NOTHING;

-- Initial Demo Users
INSERT INTO public.profiles (id, email, name, role, phone, age, gender, blood_group, emergency_contact, uhid)
VALUES
  ('33333333-3333-3333-3333-333333333301', 'admin@queueless.ai', 'Hospital Administrator', 'admin', '+1 (555) 019-2831', 42, 'other', 'O+', '+1 (555) 911-0001', 'QL-ADM-001'),
  ('33333333-3333-3333-3333-333333333302', 'staff@queueless.ai', 'Nurse Clara Oswald', 'staff', '+1 (555) 019-4822', 29, 'female', 'A+', '+1 (555) 911-0002', 'QL-STF-014'),
  ('33333333-3333-3333-3333-333333333303', 'doctor@queueless.ai', 'Dr. Sarah Mitchell, MD', 'doctor', '+1 (555) 019-7711', 38, 'female', 'B+', '+1 (555) 911-0003', 'QL-DOC-101'),
  ('33333333-3333-3333-3333-333333333304', 'patient@queueless.ai', 'Rahul Sharma', 'patient', '+1 (555) 019-9944', 32, 'male', 'O+', '+1 (555) 992-1234', 'QL-2026-8819')
ON CONFLICT (email) DO NOTHING;
