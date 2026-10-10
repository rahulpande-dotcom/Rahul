# Supabase PostgreSQL Configuration Guide

This project is built to use Supabase PostgreSQL as its permanent database store, with Row Level Security (RLS) enabled.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create or open your project.
2. In the Supabase Project Dashboard, go to **Project Settings** -> **API**.
3. Copy the following keys:
   - `Project URL`
   - `anon public key`
   - `service_role secret key` (optional, for backend administrative tasks)

## 2. Configure Environment Variables

Create a `.env.local` file in the root directory (or update `.env`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Apply Database Schema & Seed Data

1. Open the Supabase dashboard and click **SQL Editor**.
2. Click **New Query**.
3. Copy the entire contents of [`supabase/schema.sql`](./schema.sql).
4. Click **Run** (Cmd/Ctrl + Enter).
5. All tables, Row Level Security policies, indexes, and initial departments/doctors/users are created immediately!

## 4. Built-in Persistence Fallback

If you run the application without Supabase environment variables configured, QueueLess AI includes a built-in persistent local database layer (`src/lib/db.ts`) with identical seed data, role checks, and full mutation persistence. An informative status banner in the application will indicate whether live Supabase is connected or local persistence is active.
