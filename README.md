# Goats Heritage

Premium cigars and lifestyle e-commerce platform. Built for cigar enthusiasts who appreciate quality craftsmanship, exclusive membership perks, and community events.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Database & Auth:** Supabase (PostgreSQL, Auth, Storage)
- **Payments:** Stripe
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase CLI (`npm install -g supabase`)
- Stripe CLI (for webhook testing)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/goats-heritage.git
cd goats-heritage
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://lixyenbgoxgggbuvudkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run Supabase migrations

```bash
supabase db push
```

### 5. Seed the database

```bash
supabase db seed
```

Or manually run the seed file:

```bash
psql -h db.lixyenbgoxgggbuvudkg.supabase.co -U postgres -f supabase/seed.sql
```

### 6. Set up Stripe

Create products and prices in the Stripe dashboard or via the Stripe CLI. For local webhook testing:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Folder Structure

```
goats-heritage/
├── public/                  # Static assets
├── src/
│   ├── app/
│   │   ├── (admin)/         # Admin dashboard routes
│   │   ├── (protected)/     # Authenticated user routes (account)
│   │   ├── (public)/        # Public routes (shop, events)
│   │   ├── api/             # API routes & webhooks
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Homepage
│   │   ├── sitemap.ts       # Dynamic sitemap
│   │   ├── robots.ts        # Robots.txt config
│   │   └── not-found.tsx    # 404 page
│   ├── components/          # Reusable UI components
│   │   ├── shop/            # Product cards, gallery, cart
│   │   ├── events/          # Event cards, RSVP
│   │   └── ui/              # shadcn/ui primitives
│   ├── lib/
│   │   ├── supabase/        # Supabase client (server, admin, middleware)
│   │   ├── stripe/          # Stripe helpers
│   │   └── types.ts         # Shared TypeScript types
│   └── hooks/               # Custom React hooks
├── supabase/
│   ├── migrations/          # Database migrations
│   └── seed.sql             # Sample data
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json
```

## Deployment

### Deploy to Vercel

1. Push the repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Add all environment variables from `.env.local` to the Vercel project settings.
4. Set the Supabase project URL and keys for production.
5. Update `NEXT_PUBLIC_SITE_URL` to your production domain.
6. Configure the Stripe webhook endpoint to point to `https://yourdomain.com/api/webhooks/stripe`.
7. Deploy.

## License

All rights reserved.
