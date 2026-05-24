# ReplyPilot AI

A simple AI reply generator SaaS MVP for creator agencies. It includes a full landing page, dashboard, tone selector, OpenAI generation with mock fallback, copy/export controls, usage counter, login placeholder, and mood detection output.

## Tech Stack

- TypeScript
- Next.js App Router
- Tailwind CSS
- Lucide React icons

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Mock AI Behavior

The dashboard uses `src/lib/mock-ai.ts` as a local fallback to generate three reply options and infer:

- fan mood
- urgency score from 1 to 10
- spending potential as low, medium, or high

This app does not connect to real fan platforms yet.

## Connected Accounts Roadmap

The `/connected-accounts` page explains the planned integration approach for clients.
ReplyPilot AI should only read or send fan messages through official platform APIs,
approved OAuth permissions, and human-reviewed workflows. Today, the production-safe
MVP uses the manual dashboard: paste a message, generate reply drafts, review, and copy.

Planned connectors include Instagram DMs, TikTok, X/Twitter, and Email/Gmail. Email/Gmail
is the safest first connector candidate for agencies that route fan requests by email.

## MVP Pricing Tiers

- Free: 20 replies/day
- Pro: $10/month
- Agency: $19/month

## Waitlist Flow

The landing page includes a beta waitlist form with:

- name
- email
- creator or agency profile type
- biggest pain point
- plan interest

Submissions post to `POST /api/waitlist` and are stored locally in:

```bash
data/waitlist-submissions.json
```

The saved shape is Supabase-ready:

```json
{
  "id": "uuid",
  "name": "Jane",
  "email": "jane@example.com",
  "profile_type": "agency",
  "biggest_pain_point": "Inbox QA takes too long",
  "plan_interest": "pro",
  "source": "replypilot_landing",
  "status": "waitlisted",
  "created_at": "2026-05-21T00:00:00.000Z"
}
```

For Supabase, create a `waitlist_submissions` table with matching columns. The app automatically uses Supabase when these server-only environment variables exist:

```bash
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Create the table in Supabase SQL Editor:

```sql
create table waitlist_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  profile_type text not null check (profile_type in ('creator', 'agency')),
  biggest_pain_point text not null,
  plan_interest text not null default 'beta',
  source text not null default 'replypilot_landing',
  status text not null default 'waitlisted',
  created_at timestamptz not null default now()
);
```

Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only. Do not expose it with a `NEXT_PUBLIC_` prefix.

## Admin Password

The `/admin` route is protected by a simple password gate for the MVP. Set this in `.env.local`:

```bash
ADMIN_PASSWORD=your_strong_admin_password
```

Restart the dev server after changing it. The admin session is stored in an HTTP-only cookie for 8 hours.

## Client Trial Accounts

The `/login` page lets a client create credentials for a 14-day demo with 20 reply
generations. The `/dashboard` route requires login, and `POST /api/generate-replies`
enforces the trial limit on the server.

For production, create this Supabase table so trial accounts persist:

```sql
create table trial_accounts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  trial_started_at timestamptz not null default now(),
  trial_ends_at timestamptz not null,
  reply_limit integer not null default 20,
  replies_used integer not null default 0,
  plan_status text not null default 'trial' check (plan_status in ('trial', 'active', 'expired')),
  created_at timestamptz not null default now()
);
```

After the trial or 20 replies are used, clients are prompted to upgrade to Pro or Agency.
When Stripe sends `checkout.session.completed`, the webhook activates the matching trial
account by checkout email.

## Stripe Checkout

The Pro and Agency pricing buttons call `POST /api/checkout` and redirect to Stripe-hosted Checkout when Stripe is configured.

1. In Stripe, create subscription products and recurring monthly prices:

- Pro: `$10/month`
- Agency: `$19/month`

2. Add environment variables to `.env.local`:

```bash
STRIPE_SECRET_KEY=sk_test_or_live_key
STRIPE_PRO_PRICE_ID=price_pro_id
STRIPE_AGENCY_PRICE_ID=price_agency_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_WEBHOOK_SECRET=whsec_webhook_secret
```

3. Restart the app:

```bash
npm run dev
```

4. Test pricing checkout from `/#pricing`.

5. Use Stripe test card `4242 4242 4242 4242` with any future expiration date and CVC.

6. Configure a Stripe webhook endpoint for production:

```bash
https://your-domain.com/api/stripe/webhook
```

Listen for:

```bash
checkout.session.completed
```

The current webhook logs completed checkout details. Before launch, connect it to account provisioning or plan activation.

## OpenAI Setup

Create an `.env.local` file in the project root:

```bash
OPENAI_API_KEY=your_api_key_here
```

You can optionally override the default model:

```bash
OPENAI_MODEL=gpt-5.2
```

Restart the dev server after adding environment variables:

```bash
npm run dev
```

The dashboard calls `POST /api/generate-replies` with:

```json
{
  "message": "Incoming fan message",
  "tone": "friendly"
}
```

The route returns:

```json
{
  "replies": ["Reply one", "Reply two", "Reply three"],
  "fanMood": "curious",
  "urgencyScore": 5,
  "spendingPotential": "medium"
}
```

If `OPENAI_API_KEY` is missing, the API route returns mock replies. If the OpenAI request fails, the frontend falls back to mock replies so the workflow still works.

## Useful Scripts

```bash
npm run dev
npm run build
npm run start
```

## Deploying to Vercel

1. Push the project to a GitHub repository.
2. In Vercel, choose **Add New Project** and import the repository.
3. Use the default Next.js settings:

```bash
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

4. Add environment variables in Vercel Project Settings:

```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.2
```

5. For production waitlist storage, replace the local JSON file with Supabase before launch. Vercel serverless functions should not be treated as durable file storage.
6. Redeploy after adding environment variables.
7. Test these routes after deploy:

```bash
/
/dashboard
/connected-accounts
/outreach-kit
/admin
/thank-you
/privacy
/terms
```

## Final Launch Checklist

- `npm run build` passes locally.
- OpenAI key is valid and has quota.
- Waitlist storage is moved from local JSON to Supabase or another durable database.
- Privacy and Terms placeholders are replaced with real policies.
- Stripe checkout creates sessions for Pro and Agency in test mode.
- Admin route is protected before sharing publicly.
- Test mobile layouts for homepage, dashboard, waitlist, and admin table.
- Confirm all footer links work.
- Submit a waitlist lead and verify it appears in `/admin`.
- Export CSV from `/admin` and confirm the file opens.
- Run through the 60-second demo script from `/outreach-kit`.
