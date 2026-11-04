# Calibra - Calibration Due Date Management System

Calibra is a calibration laboratory dashboard built with React, Vite, Tailwind CSS, and Supabase.

## What is included

- Customer management and search
- Calibration schedules and recurring cycles
- Common, individual and mixed due-date handling
- Optional instrument-level records
- Dashboard summary cards and alerts
- CSV export for schedule reporting
- Supabase Auth and Row Level Security setup

## Database setup

Run the migration in Supabase SQL Editor:

- supabase/migrations/20261104000000_initial_calibration_schema.sql

This creates the required tables for customers, calibration schedules, calibration cycles, cycle items, and the optional instrument master table.

## Local environment

1. Copy `.env.example` to `.env`
2. Add your Supabase project URL and anon key
3. Enable Email authentication in Supabase Auth
4. Run the SQL migration
5. Start the app with `npm install` and `npm run dev`

## Important beginner concepts

- Primary key: a unique identifier for each row in a table.
- Foreign key: a reference from one table to another, such as a schedule pointing to a customer.
- RLS: Row Level Security controls which logged-in users may read or update data.
- Migration: a versioned SQL change that creates or updates the database schema.
- Historical cycle: a record that is never overwritten, so all previous calibration work remains visible.

## Run the app

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.
