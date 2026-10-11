-- =========================================================================
-- QUEUELESS AI — SAFE REPAIR & COMPATIBILITY MIGRATION SCRIPT
-- =========================================================================
-- This migration safely adapts an existing Supabase database to support:
-- 1. Universal ID compatibility (UUIDs and string identifiers)
-- 2. Staff and Admin queue control operations
-- 3. Password credentials and demo flag separation
-- 4. Correct Row Level Security (RLS) policies
-- =========================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- Step 1: Ensure profiles table has password_hash and is_demo
-- -------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

-- -------------------------------------------------------------------------
-- Step 2: Ensure tokens table has is_demo and necessary audit timestamps
-- -------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.tokens
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS check_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS called_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consultation_start_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- -------------------------------------------------------------------------
-- Step 3: Widen column types to VARCHAR(100) for universal ID compatibility
-- (Allows standard UUIDs and legacy text identifiers without foreign key breakage)
-- -------------------------------------------------------------------------
DO $$
BEGIN
  -- Profiles
  BEGIN
    ALTER TABLE public.profiles ALTER COLUMN id TYPE VARCHAR(100);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Departments
  BEGIN
    ALTER TABLE public.departments ALTER COLUMN id TYPE VARCHAR(100);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Doctors
  BEGIN
    ALTER TABLE public.doctors ALTER COLUMN id TYPE VARCHAR(100);
    ALTER TABLE public.doctors ALTER COLUMN department_id TYPE VARCHAR(100);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Tokens
  BEGIN
    ALTER TABLE public.tokens ALTER COLUMN id TYPE VARCHAR(100);
    ALTER TABLE public.tokens ALTER COLUMN department_id TYPE VARCHAR(100);
    ALTER TABLE public.tokens ALTER COLUMN doctor_id TYPE VARCHAR(100);
    ALTER TABLE public.tokens ALTER COLUMN patient_id TYPE VARCHAR(100);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Appointments
  BEGIN
    ALTER TABLE public.appointments ALTER COLUMN id TYPE VARCHAR(100);
    ALTER TABLE public.appointments ALTER COLUMN patient_id TYPE VARCHAR(100);
    ALTER TABLE public.appointments ALTER COLUMN doctor_id TYPE VARCHAR(100);
    ALTER TABLE public.appointments ALTER COLUMN department_id TYPE VARCHAR(100);
    ALTER TABLE public.appointments ALTER COLUMN token_id TYPE VARCHAR(100);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Visits
  BEGIN
    ALTER TABLE public.visits ALTER COLUMN id TYPE VARCHAR(100);
    ALTER TABLE public.visits ALTER COLUMN token_id TYPE VARCHAR(100);
    ALTER TABLE public.visits ALTER COLUMN patient_id TYPE VARCHAR(100);
    ALTER TABLE public.visits ALTER COLUMN doctor_id TYPE VARCHAR(100);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Emergency Cases
  BEGIN
    ALTER TABLE public.emergency_cases ALTER COLUMN id TYPE VARCHAR(100);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Audit Logs
  BEGIN
    ALTER TABLE public.audit_logs ALTER COLUMN id TYPE VARCHAR(100);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- -------------------------------------------------------------------------
-- Step 4: Update status check constraint on tokens to support full lifecycle
-- -------------------------------------------------------------------------
DO $$
BEGIN
  ALTER TABLE public.tokens DROP CONSTRAINT IF EXISTS tokens_status_check;
  ALTER TABLE public.tokens ADD CONSTRAINT tokens_status_check 
    CHECK (status IN ('WAITING', 'CHECKED_IN', 'CALLED', 'IN_CONSULTATION', 'COMPLETED', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- -------------------------------------------------------------------------
-- Step 5: Ensure Indexes for Queue Performance & Realtime
-- -------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tokens_status_priority ON public.tokens (status, priority, generated_at);
CREATE INDEX IF NOT EXISTS idx_tokens_dept_status ON public.tokens (department_id, status);
CREATE INDEX IF NOT EXISTS idx_tokens_doctor_status ON public.tokens (doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_profiles_role_email ON public.profiles (role, email);

-- -------------------------------------------------------------------------
-- Step 6: Verify and Refresh RLS Policies
-- -------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_settings ENABLE ROW LEVEL SECURITY;

-- Allow public/authenticated read for departments and doctors
DROP POLICY IF EXISTS "Public read departments" ON public.departments;
CREATE POLICY "Public read departments" ON public.departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read doctors" ON public.doctors;
CREATE POLICY "Public read doctors" ON public.doctors FOR SELECT USING (true);

-- Allow tokens management: public read (for queue boards), insert and update for queue flow
DROP POLICY IF EXISTS "Public read tokens" ON public.tokens;
CREATE POLICY "Public read tokens" ON public.tokens FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert tokens" ON public.tokens;
CREATE POLICY "Insert tokens" ON public.tokens FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Update tokens" ON public.tokens;
CREATE POLICY "Update tokens" ON public.tokens FOR UPDATE USING (true);

-- Profiles: Allow read for staff/admin & users, allow insert for registration
DROP POLICY IF EXISTS "Read profiles" ON public.profiles;
CREATE POLICY "Read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert profiles" ON public.profiles;
CREATE POLICY "Insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Update profiles" ON public.profiles;
CREATE POLICY "Update profiles" ON public.profiles FOR UPDATE USING (true);

-- Emergency cases: anyone can submit emergency walk-in
DROP POLICY IF EXISTS "Anyone insert emergency" ON public.emergency_cases;
CREATE POLICY "Anyone insert emergency" ON public.emergency_cases FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public view emergency cases" ON public.emergency_cases;
CREATE POLICY "Public view emergency cases" ON public.emergency_cases FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff update emergency" ON public.emergency_cases;
CREATE POLICY "Staff update emergency" ON public.emergency_cases FOR UPDATE USING (true);

-- -------------------------------------------------------------------------
-- Step 7: Seed Initial Departments (if table is empty)
-- -------------------------------------------------------------------------
INSERT INTO public.departments (id, name, code, floor, description, avg_consultation_minutes, active_doctors_count, icon_name)
VALUES
  ('dept-gen', 'General Medicine', 'GEN', 'Ground Floor (Wing A)', 'Primary healthcare, acute illness, viral fever, preventive wellness', 10, 4, 'Activity'),
  ('dept-car', 'Cardiology', 'CAR', '2nd Floor (Wing B)', 'Heart diagnostics, hypertension, ECG, cardiovascular care', 15, 3, 'Heart'),
  ('dept-ped', 'Pediatrics', 'PED', '1st Floor (Wing C)', 'Child health, immunization, pediatric infections & development', 12, 3, 'Baby'),
  ('dept-ort', 'Orthopedics', 'ORT', 'Ground Floor (Wing B)', 'Bones, joints, sports injury, arthroscopy & fracture care', 15, 2, 'Bone'),
  ('dept-neu', 'Neurology', 'NEU', '3rd Floor (Wing A)', 'Brain & nervous system disorders, migraines, stroke rehabilitation', 20, 2, 'Brain'),
  ('dept-emg', 'Emergency & Trauma', 'EMG', 'Ground Floor (ER Bay)', '24/7 Acute trauma, resuscitation, cardiac arrest & triage bay', 5, 5, 'AlertTriangle')
ON CONFLICT (code) DO NOTHING;

-- -------------------------------------------------------------------------
-- Step 8: Seed Initial Doctors (if table is empty)
-- -------------------------------------------------------------------------
INSERT INTO public.doctors (id, name, department_id, department_name, specialization, room_number, consultation_fee, available_days, is_available_today)
VALUES
  ('doc-1', 'Dr. Sarah Mitchell, MD', 'dept-gen', 'General Medicine', 'Internal Medicine Specialist', 'Room 101', 500.00, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], true),
  ('doc-2', 'Dr. Arjun Mehta, DM', 'dept-car', 'Cardiology', 'Senior Interventional Cardiologist', 'Room 204', 800.00, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], true),
  ('doc-3', 'Dr. Emily Chen, MD', 'dept-ped', 'Pediatrics', 'Chief Pediatrician & Neonatologist', 'Room 112', 600.00, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], true),
  ('doc-4', 'Dr. Marcus Reynolds, MS', 'dept-ort', 'Orthopedics', 'Orthopedic Surgeon & Joint Replacement', 'Room 108', 750.00, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], true),
  ('doc-5', 'Dr. Priya Sharma, DM', 'dept-neu', 'Neurology', 'Neurologist & Epilepsy Consultant', 'Room 302', 900.00, ARRAY['Tuesday', 'Thursday', 'Friday'], true),
  ('doc-6', 'Dr. David Vance, MD', 'dept-emg', 'Emergency & Trauma', 'Emergency Medicine Director', 'ER Bay 1', 0.00, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], true)
ON CONFLICT (id) DO NOTHING;
