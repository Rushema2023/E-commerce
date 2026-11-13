# Backend — Berwa Collections

This folder contains the Supabase database setup. The Vercel serverless functions
live in `frontend/api/`, because Vercel deploys `frontend/` as the project root.

## Structure

```
backend/
  api/                    ← Vercel serverless functions (Node.js)
    create-order.ts       ← POST /api/create-order  (validates cart, creates order, returns payment instructions)
    admin/
      approve-payment.ts  ← POST /api/admin/approve-payment  (admin only — approves payment)
      reject-payment.ts   ← POST /api/admin/reject-payment   (admin only — rejects payment)
  supabase/
    migrations/           ← SQL migration files (run in Supabase SQL editor)
      001_initial_schema.sql
      002_rls_policies.sql
      003_storage.sql
      004_secure_order_workflow.sql
      005_global_checkout.sql
      006_order_currency_snapshots.sql
    seed.sql              ← Sample data for development
    functions/            ← Supabase Edge Functions (optional)
  README.md               ← This file
```

## Setup (to be completed after frontend)

The active server endpoints are `frontend/api/create-order.ts`,
`frontend/api/submit-payment.ts`, and the two `frontend/api/admin/*` payment
review endpoints. The legacy tree above is retained only as an outline.

1. Create a Supabase project at https://supabase.com
2. Copy `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from Project Settings → API
3. Run SQL migrations in Supabase SQL editor (in order: 001 through 006)
4. Run `supabase/seed.sql` to populate the development catalogue
5. Create admin user: Register normally, then run:
   `UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';`
6. Deploy `frontend/` as the Vercel project root and add `SUPABASE_URL` and
   `SUPABASE_SERVICE_ROLE_KEY` to Vercel environment variables (server-side only)

## Security Notes

- Service role key is NEVER exposed to the browser
- All payment approvals go through server-side functions that verify admin status via Supabase service role
- RLS policies enforce row-level access so customers can only see their own data
- The customer may choose a display currency, but the Vercel order endpoint obtains
  the exchange rate server-side and migration 006 locks the selected currency,
  rate, and converted order totals for payment review.
