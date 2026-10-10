# QueueLess AI — Smart Hospital Token & Patient Management System

QueueLess AI is a full-stack, responsive hospital token and patient journey management web application designed to eliminate physical hospital queues, digitize patient intake, provide real-time queue synchronization with audio chime alerts, and maintain a permanent electronic medical record (EHR) from registration to consultation checkout.

---

## 🏥 Key Features & Capabilities

- **Modern SaaS Landing Page:** Professional healthcare blue-and-white theme, hero queue explainer, live OPD display board preview, benefits matrix for patients and clinical staff.
- **Three Independent Protected Portals:**
  - **Patient Portal:** Live queue countdown, appointment scheduler, digital tokens, audio chime alerts, clinical history, and 1-click PDF medical report downloads.
  - **Staff / Doctor Portal:** Walk-in kiosk registration, live OPD queue calling desk with priority triage (Emergency & Senior Citizen precedence), clinical vitals and prescription recording console, discharge & billing checkout.
  - **Admin Executive Portal:** Executive metrics, Recharts visual analytics (hourly OPD traffic, department load distributions), doctor schedule management, security audit trail, and hospital settings.
- **Unauthenticated Emergency Intake (`/emergency`):**
  - Allows patients, bystanders, or paramedics to register emergency trauma cases without login.
  - Immediately allocates a Priority 1 **RED EMERGENCY TOKEN** (`EMG-XXX`), sets wait time to 0 minutes, and triggers emergency alerts.
  - Includes speed dials for ambulance dispatch, poison control, and ER nursing desks.
- **Four-Character Dynamic CAPTCHA:**
  - Server-generated distorted alphanumeric SVG with noise lines and background dots.
  - Cryptographically signed HMAC verification tokens (answer is never exposed to the client).
  - Audio spoken assistance for accessibility.
- **Remember Me & Previously Used Account Suggestions:**
  - One-click account switcher chips for instant evaluation across roles.
- **Priority-Aware Queue Algorithm:**
  - Strict priority order: Emergency (Resuscitation) ➔ Senior Citizens ➔ Regular Online/Walk-in tokens.
  - Calculates estimated wait times based on department consultation averages.
- **Audio Chime System (Web Audio API):**
  - Synthesizes pleasant three-tone chords (C5 ➔ E5 ➔ G5) when tokens are called.
  - Eliminates dependency on external mp3 assets.
- **One-Click PDF Medical Report Generation (`pdf-lib`):**
  - Generates authentic medical consultation reports with hospital letterhead, UHID, vital signs box, ICD-10 diagnosis, medication table, advice, and digital verification seal.
- **Dual Persistent Database Layer:**
  - **Supabase PostgreSQL:** Complete schema provided in `supabase/schema.sql` with Row Level Security (RLS) policies, indexes, and triggers.
  - **Local Persistent Engine:** Built-in zero-configuration file store ensuring full persistence across reloads even before connecting live Supabase credentials.

---

## 🛠 Technology Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS with custom healthcare palette
- **Icons:** Lucide React
- **Data Visualization:** Recharts
- **PDF Generation:** pdf-lib
- **Audio:** Web Audio API synthesizer
- **Database & Auth:** Supabase PostgreSQL with Row Level Security (RLS) & Local Persistent Store
- **Validation:** Cryptographic HMAC & Zod
- **Testing:** Vitest

---

## 👥 Demo Accounts & Role Matrix

Quick-fill chips are available directly on the `/login` page:

| Portal | Email | Password | Role Description |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@queueless.ai` | `Patient@123` | Registered Patient (UHID: `QL-2026-8819`) |
| **Staff** | `staff@queueless.ai` | `Staff@123` | OPD Reception & Head Triage Nurse |
| **Doctor** | `doctor@queueless.ai` | `Doctor@123` | Consulting Physician (Room 101) |
| **Admin** | `admin@queueless.ai` | `Admin@123` | Hospital Chief Administrator |

---

## 🚀 Getting Started

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd queueless-ai

# Install dependencies
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

### 3. Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄 Supabase PostgreSQL Setup (Optional Live Connection)

The system works out of the box with persistent disk storage. To link your live Supabase PostgreSQL database:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in Supabase and paste the contents of [`supabase/schema.sql`](./supabase/schema.sql).
3. Click **Run**.
4. Add your Supabase keys to `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
5. Restart Next.js. The status badge will reflect **"Supabase PostgreSQL (Live)"**!

---

## 🧪 Automated Testing

Run the Vitest test suite covering authentication, CAPTCHA cryptography, and priority queue calculations:

```bash
npm test
```

### Test Coverage Highlights:
- `test/auth.test.ts`: 4-character CAPTCHA generation, distortion SVG, invalid code rejection, session token signing and verification.
- `test/queue.test.ts`: Queue wait time estimations, Senior Citizen priority reduction, Emergency zero-wait precedence, token number format validators.
- `test/emergency.test.ts`: Unauthenticated emergency trauma intake, instant Level 1 triage token allocation.

---

## 📂 Route Directory Structure

```
src/app/
├── (auth)/
│   ├── login/               # Portal login with role tabs & CAPTCHA
│   ├── register/            # Patient registration with UHID issuance
│   ├── forgot-password/     # Password recovery
│   └── reset-password/      # Password reset
├── (public)/
│   ├── page.tsx             # Public SaaS landing page
│   ├── emergency/           # Unauthenticated ER trauma intake
│   ├── unauthorized/        # Role access denied page
│   ├── privacy/             # HIPAA compliance policy
│   └── terms/               # Terms & conditions
├── admin/
│   ├── dashboard/           # Analytics charts & operational surveillance
│   ├── patients/            # Master patient index & medical records
│   ├── staff/               # Hospital staff registry
│   ├── doctors/             # Doctor duty scheduling & room assignments
│   ├── departments/         # OPD wings & duration parameters
│   ├── appointments/        # Master hospital schedule
│   ├── tokens/              # Master token queue ledger
│   ├── visits/              # Clinical visit encounter records
│   ├── emergency/           # Emergency response tracker
│   ├── reports/             # Queue SLA analytics & report generation
│   ├── audit-logs/          # Immutable security compliance logs
│   └── settings/            # Hospital configuration & Supabase hub
├── staff/
│   ├── dashboard/           # Reception counter metrics
│   ├── register-patient/    # Walk-in kiosk & instant token printer
│   ├── patients/            # Patient lookup & vitals history
│   ├── queue/               # Live OPD Calling Desk (Call Next, No-Show)
│   ├── appointments/        # Daily check-in desk
│   ├── visits/              # Doctor consultation & prescription console
│   ├── emergency/           # ER triage bay monitor
│   └── checkout/            # Discharge & billing checkout
└── patient/
    ├── dashboard/           # Patient health overview & active token
    ├── profile/             # Demographic profile & emergency contacts
    ├── book-appointment/    # Online token & slot booking
    ├── my-tokens/           # Active and historical tokens
    ├── queue-status/        # Real-time queue tracker & audio chime
    ├── appointments/        # Scheduled visits
    ├── medical-history/     # Complete clinical EHR timeline
    ├── my-reports/          # One-click PDF report downloads
    └── security/            # Password & session management
```

---

## 🔒 Security & Privacy Practices

- **Row Level Security (RLS):** Configured on all Supabase tables ensuring patients only read their own encounters.
- **Server-Side Authorization:** Route layouts enforce role checks on the server; tampering with frontend state cannot bypass portal access.
- **Sensitive Key Protection:** `SUPABASE_SERVICE_ROLE_KEY` and CAPTCHA answers are never exposed to browser clients.
- **Sanitized Healthcare PDFs:** Medical reports generated server-side using immutable patient consultation snapshots.
# Rahul
