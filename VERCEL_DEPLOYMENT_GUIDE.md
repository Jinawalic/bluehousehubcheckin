# Vercel Deployment Guide for Bluehouse Hub Check-in

This project is fully verified and ready to be deployed to [Vercel](https://vercel.com).

---

## 1. Prerequisites
- A Vercel account linked to your GitHub/GitLab repository.
- A PostgreSQL database (e.g., [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Vercel Postgres]).

---

## 2. Environment Variables to Set in Vercel

In your Vercel Project Dashboard (**Settings > Environment Variables**), configure the following:

| Variable | Description | Example / Note |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` |
| `AUTH_SECRET` | 32+ character random secret for signing admin session cookies | e.g. `openssl rand -hex 32` or any long random string |
| `ADMIN_EMAIL` | Initial hub administrator email | e.g. `admin@bluehouse.tech` |
| `ADMIN_PASSWORD` | Initial hub administrator password | Secure password (first login automatically seeds this admin in DB) |
| `ADMIN_NAME` | Initial administrator display name | `Hub Administrator` |
| `NEXT_PUBLIC_API_URL` | Optional API URL | Leave empty or set to your custom domain |

---

## 3. Database Migration / Push

Before or right after your first deployment, push the Prisma schema to your production database:

```bash
# Push schema tables and indexes to your production database
npx prisma db push
```

*(Optional)* Seed default tracks and initial data:
```bash
npx prisma db seed
```

---

## 4. Build & Deployment Settings on Vercel

Vercel will automatically detect **Next.js**. The project is already configured with:

- **Framework Preset**: `Next.js`
- **Build Command**: `vercel-build` (Runs `prisma generate && next build`)
- **Install Command**: `npm install` (Runs `postinstall: prisma generate`)
- **Node.js Version**: `18.x` or `20.x` (Recommended: 20.x)

---

## 5. Verification Checklist

- [x] TypeScript compilation (`npx tsc --noEmit`): **0 errors**
- [x] ESLint validation (`npm run lint`): **0 errors, 0 warnings**
- [x] Production build (`npm run build`): **All 14 static & dynamic routes compiled successfully**
- [x] Case-insensitivity verified for Linux filesystems
- [x] Automatic Prisma Client generation configured for Vercel builds (`vercel-build`)
