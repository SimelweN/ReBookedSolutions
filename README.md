# ReBooked Solutions

A secure platform for buying and selling used textbooks built with React, TypeScript, and Supabase.

## Quick Start

1. **Install dependencies:**

   ```bash
   yarn install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your actual values:
   - Get Supabase credentials from https://supabase.com/dashboard
   - Get Paystack keys from https://dashboard.paystack.com

3. **Start development server:**
   ```bash
   yarn dev
   ```

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI:** Tailwind CSS, shadcn/ui, Radix UI
- **Backend:** Supabase (Auth, Database, Storage)
- **Payments:** Paystack
- **Deployment:** Netlify/Vercel

## Environment Variables

Required:

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

Optional (for full features):

- `VITE_PAYSTACK_PUBLIC_KEY` - Paystack public key
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key
- `VITE_COURIER_GUY_API_KEY` - Courier Guy API key

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── services/           # API services
├── utils/              # Utility functions
└── types/              # TypeScript types
```

## Deployment

**Netlify:**
Set environment variables in Netlify dashboard under Site Settings > Environment Variables.

**Vercel:**
Set environment variables in Vercel dashboard under Project Settings > Environment Variables.

## License

Private - ReBooked Solutions
