# Berwa Collections frontend

React, TypeScript and Vite storefront for Berwa Collections. The browser uses
Supabase Auth and public catalogue reads; sensitive order and payment actions
are implemented as Vercel serverless functions under `api/`.

## Local setup

1. Copy `.env.example` to `.env.local` and set only `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` for the browser.
2. In Supabase SQL Editor, run the backend migrations in numerical order:
   `001_initial_schema.sql` through `006_order_currency_snapshots.sql`.
3. Run `backend/supabase/seed.sql` in Supabase to create a development catalogue,
   or create categories and products manually. Products must use category slugs
   `men`, `women`, or `accessories`.
4. Start the app with `npm.cmd run dev` on Windows (or `npm run dev` where
   PowerShell execution policy permits it).

## Vercel configuration

Deploy the `frontend` directory as the Vercel project root. Configure these
environment variables in Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL` (same project URL, server-only)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose it with a `VITE_` prefix)

`POST /api/create-order` calls `create_secure_order`, which validates current
database prices, stock, and selected options before updating inventory and
creating the order. It requires a signed-in customer. `POST /api/submit-payment`
records a customer transaction reference for review. Administrator-only
approval and rejection endpoints are at `/api/admin/approve-payment` and
`/api/admin/reject-payment`.

## Local-currency price display

Store prices and order totals remain securely calculated and recorded in RWF.
The storefront detects the customer's browser region, selects a matching
display currency where supported, and loads exchange rates from the public
ExchangeRate-API endpoint. Customers can change the currency from the header;
their choice and a rate cache are kept in browser storage for 12 hours. A
non-RWF amount is an estimate until checkout. At checkout, the server obtains
the exchange rate itself and locks the currency, rate, and converted totals on
the order for payment review.

## Verification

```sh
npm run build
npm run lint
```

Before launch, configure actual Mobile Money/bank details in `store_settings`,
implement receipt uploads to the private `payment-receipts` bucket, and replace
the placeholder business and social details. Payment references remain pending
until an authenticated administrator approves them; no automatic payment gateway
is claimed or configured.
