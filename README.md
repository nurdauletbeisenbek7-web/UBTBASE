# UBT BASE

AI-powered UNT (ЕНТ) preparation platform for Mathematics and Informatics.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Auth + Database)
- **OpenAI API** (AI explanations)

## Features

- User authentication (Sign Up, Login, Logout)
- Landing page with call-to-action
- Dashboard with stats, weak topics, and recent results
- Subject selection (Mathematics, Informatics)
- 20-question practice tests with scoring
- Results page with wrong answer review
- AI-powered explanations for incorrect answers
- Admin page for adding questions

## Getting Started

### 1. Clone and install

```bash
cd ubt-base
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run:
   - `supabase/schema.sql`
   - `supabase/seed.sql`
3. Copy your project URL and anon key from **Settings → API**

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in your Supabase and OpenAI credentials. Set `ADMIN_EMAILS` to your admin email(s).

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push the project to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
   - `ADMIN_EMAILS`
4. Deploy

In Supabase, add your Vercel URL to **Authentication → URL Configuration → Redirect URLs**:
```
https://your-app.vercel.app/auth/callback
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/                # Login
│   ├── signup/               # Sign up
│   ├── dashboard/            # User dashboard
│   ├── subjects/             # Subject selection
│   ├── test/[subject]/       # Test taking
│   ├── results/[testId]/     # Test results
│   ├── admin/                # Admin question management
│   ├── auth/callback/        # Supabase auth callback
│   └── api/
│       ├── tests/            # Test fetch & submit
│       ├── ai/explain/       # OpenAI explanations
│       └── admin/questions/  # Add questions
├── components/               # UI components
└── lib/                      # Supabase, auth, types
supabase/
├── schema.sql                # Database schema
└── seed.sql                  # Sample questions
```

## Database Tables

| Table      | Description                          |
|------------|--------------------------------------|
| users      | User profiles (synced from auth)     |
| questions  | Test questions with options          |
| tests      | Completed test records               |
| answers    | Individual answer records per test   |

## License

MIT
