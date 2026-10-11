-- =========================================================================
-- QUEUELESS AI — ENTERPRISE EXPANSION DATABASE MIGRATION (V2)
-- PostgreSQL with Multi-Hospital Support, Itemized Billing (INR),
-- Surgical Procedures, AI Clinical Decision Support, and In-App Notifications
-- =========================================================================

-- Enable uuid and pgcrypto extensions if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- 1. HOSPITALS DIRECTORY TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.hospitals (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL,
  emergency_phone VARCHAR(50) NOT NULL,
  ambulance_number VARCHAR(50) NOT NULL,
  operating_hours VARCHAR(100) NOT NULL DEFAULT '24/7 Emergency & Inpatient, OPD: 08:00 AM - 08:00 PM',
  accreditations TEXT[] DEFAULT ARRAY['NABH Accredited', 'NABL Certified'],
  total_departments INT DEFAULT 20,
  active_doctors_count INT DEFAULT 80,
  emergency_beds INT DEFAULT 25,
  icu_beds INT DEFAULT 15,
  is_network_partner BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 2. ALTER EXISTING TABLES FOR MULTI-HOSPITAL & ADVANCED OPD
-- =========================================================================
ALTER TABLE public.departments 
  ADD COLUMN IF NOT EXISTS hospital_id VARCHAR(50) DEFAULT 'hosp-queueless-blr',
  ADD COLUMN IF NOT EXISTS standard_fee NUMERIC(10, 2) DEFAULT 1500.00,
  ADD COLUMN IF NOT EXISTS services TEXT[] DEFAULT ARRAY['General Consultation', 'Follow-up Checkup'],
  ADD COLUMN IF NOT EXISTS image_path TEXT;

ALTER TABLE public.doctors 
  ADD COLUMN IF NOT EXISTS hospital_id VARCHAR(50) DEFAULT 'hosp-queueless-blr',
  ADD COLUMN IF NOT EXISTS qualifications VARCHAR(255) DEFAULT 'MBBS, MD',
  ADD COLUMN IF NOT EXISTS experience_years INT DEFAULT 8,
  ADD COLUMN IF NOT EXISTS appointment_capacity_per_day INT DEFAULT 40;

ALTER TABLE public.appointments 
  ADD COLUMN IF NOT EXISTS hospital_id VARCHAR(50) DEFAULT 'hosp-queueless-blr';

ALTER TABLE public.tokens 
  ADD COLUMN IF NOT EXISTS hospital_id VARCHAR(50) DEFAULT 'hosp-queueless-blr';

ALTER TABLE public.visits 
  ADD COLUMN IF NOT EXISTS hospital_id VARCHAR(50) DEFAULT 'hosp-queueless-blr';

-- =========================================================================
-- 3. UNIQUE CONSTRAINTS (Doctor Display Name Uniqueness & Double Booking Guard)
-- =========================================================================
-- Enforce normalized, case-insensitive doctor uniqueness within hospital
CREATE UNIQUE INDEX IF NOT EXISTS idx_doctors_unique_name_hosp 
  ON public.doctors (LOWER(TRIM(name)), hospital_id);

-- Enforce zero double-booking for physician time slots
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_no_double_book 
  ON public.appointments (doctor_id, date, time_slot) 
  WHERE status != 'CANCELLED';

-- =========================================================================
-- 4. ITEMIZED MEDICAL BILLS & INVOICES (INR ₹)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.bills (
  id VARCHAR(50) PRIMARY KEY,
  bill_number VARCHAR(50) UNIQUE NOT NULL,
  patient_id VARCHAR(50) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  encounter_id VARCHAR(50),
  hospital_id VARCHAR(50) NOT NULL DEFAULT 'hosp-queueless-blr',
  hospital_name VARCHAR(255) NOT NULL DEFAULT 'QueueLess Medical Center & Research Institute',
  department_name VARCHAR(150) NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  discount_amount NUMERIC(12, 2) DEFAULT 0.00,
  discount_reason TEXT,
  tax_amount NUMERIC(12, 2) DEFAULT 0.00,
  total_amount NUMERIC(12, 2) NOT NULL,
  amount_paid NUMERIC(12, 2) DEFAULT 0.00,
  balance_due NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'WAIVED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.bill_items (
  id VARCHAR(50) PRIMARY KEY,
  bill_id VARCHAR(50) REFERENCES public.bills(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  quantity INT DEFAULT 1,
  unit_price NUMERIC(12, 2) NOT NULL,
  total_price NUMERIC(12, 2) NOT NULL
);

-- =========================================================================
-- 5. SURGICAL & CLINICAL PROCEDURES TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.procedures (
  id VARCHAR(50) PRIMARY KEY,
  procedure_name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  patient_id VARCHAR(50) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  doctor_id VARCHAR(50) NOT NULL,
  doctor_name VARCHAR(255) NOT NULL,
  department_name VARCHAR(150) NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  room_number VARCHAR(50) NOT NULL,
  pre_op_notes TEXT,
  post_op_notes TEXT,
  complications TEXT,
  surgeon_notes TEXT,
  verified_by_surgeon BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 6. AI CLINICAL DECISION SUPPORT TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  doctor_id VARCHAR(50) NOT NULL,
  visit_id VARCHAR(50),
  differentials JSONB DEFAULT '[]'::jsonb,
  red_flags TEXT[] DEFAULT ARRAY[]::TEXT[],
  suggested_investigations TEXT[] DEFAULT ARRAY[]::TEXT[],
  clinical_questions TEXT[] DEFAULT ARRAY[]::TEXT[],
  disclaimer TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DISMISSED')),
  approved_by_doctor_name VARCHAR(255),
  clinician_edits TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 7. IN-APP REAL-TIME NOTIFICATIONS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id VARCHAR(50) PRIMARY KEY,
  recipient_user_id VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('TOKEN_CALLED', 'EMERGENCY_ALERT', 'BILL_GENERATED', 'APPOINTMENT_CONFIRMED', 'SYSTEM')),
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 8. PERFORMANCE INDEXES
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_bills_patient_id ON public.bills (patient_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON public.bills (status);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON public.bill_items (bill_id);
CREATE INDEX IF NOT EXISTS idx_procedures_patient_id ON public.procedures (patient_id);
CREATE INDEX IF NOT EXISTS idx_procedures_doctor_id ON public.procedures (doctor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications (recipient_user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_visit ON public.ai_suggestions (visit_id);

-- =========================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow public read access to hospitals directory
CREATE POLICY "Public read hospitals" ON public.hospitals FOR SELECT USING (true);

-- Allow authenticated read/write to bills, procedures, ai_suggestions, and notifications
CREATE POLICY "Public read bills" ON public.bills FOR SELECT USING (true);
CREATE POLICY "Public insert bills" ON public.bills FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update bills" ON public.bills FOR UPDATE USING (true);

CREATE POLICY "Public read bill_items" ON public.bill_items FOR SELECT USING (true);
CREATE POLICY "Public insert bill_items" ON public.bill_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read procedures" ON public.procedures FOR SELECT USING (true);
CREATE POLICY "Public insert procedures" ON public.procedures FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update procedures" ON public.procedures FOR UPDATE USING (true);

CREATE POLICY "Public read ai_suggestions" ON public.ai_suggestions FOR SELECT USING (true);
CREATE POLICY "Public insert ai_suggestions" ON public.ai_suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update ai_suggestions" ON public.ai_suggestions FOR UPDATE USING (true);

CREATE POLICY "Public read notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Public insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update notifications" ON public.notifications FOR UPDATE USING (true);
