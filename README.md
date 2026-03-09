# Digidaw - Digital Products E-Commerce

Digidaw is a modern, full-stack e-commerce web application designed specifically for selling digital products. Built with a sleek "High-End Studio Dark Theme" aesthetic featuring neon green accents, it offers a premium user experience from browsing to checkout.

## Features

- **Storefront:**
  - Modern, responsive landing page.
  - Product catalog with listing and detailed views.
  - Shopping cart with persistent state management.
  - Checkout process with dynamic payment methods.
  - WhatsApp integration for seamless order confirmations.
  - Fully localized in Indonesian.
- **Admin Dashboard:**
  - Secure JWT authentication for UI and API routes, plus password management.
  - Product management with Supabase Storage image uploads.
  - Order tracking and management.
  - Dynamic site settings configuration (Hero, Features, Contact, etc.).
  - Payment method configuration.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI & Styling:** React 19, Tailwind CSS v4, Lucide React icons
- **State Management:** Zustand, TanStack Query (React Query)
- **Forms & Validation:** React Hook Form, Zod
- **Database & Backend:** Supabase (PostgreSQL, Auth, Storage), JWT (jose)

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm, yarn, pnpm, or bun
- A Supabase account and project

### Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/raflyirham/digidaw
   cd digidaw
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or yarn install, pnpm install, bun install
   ```

3. **Set up environment variables:**
   Copy the `env.example` file to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp env.example .env.local
   ```
   Add your `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `ADMIN_JWT_SECRET`.

4. **Set up Supabase Database:**
   Execute the `supabase/database.sql` script in your Supabase project's SQL Editor to run the migrations, create the schema, enable Row Level Security (RLS), and insert initial seed data.

5. **Start the development server:**
   ```bash
   npm run dev
   # or yarn dev, pnpm dev, bun dev
   ```

6. **View the app:**
   - Open [http://localhost:3000](http://localhost:3000) to see the storefront.
   - Open [http://localhost:3000/admin](http://localhost:3000/admin) to access the admin panel.

## Learn More

To learn more about the technologies used in this project:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
