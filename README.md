# MedFlow — SaaS for clinic operations

---

## 📌 Description

MedFlow is a Full‑Stack SaaS application designed to digitize clinic operations: patient management, appointments, medical records, prescriptions (PDF export), billing, and a dedicated patient portal. This repository contains both frontend and API code, database configuration (Prisma + PostgreSQL).

---

## 🚀 Core Features 

* Authentication & RBAC (Admin, Doctor, Receptionist, Patient)
* Patient Management (CRUD, medical history)
* Appointments (create, edit, cancel, calendar view)
* Consultations & Prescriptions (diagnosis, PDF export)
* Billing & Payments (Stripe integration, test mode)
* Patient Portal (booking, payments, document downloads)
* Administration (services, staff, pricing management)

---

## 🧭 Tech Stack

* **Frontend**: Next.js 15 (App Router), React, Tailwind CSS, shadcn/ui
* **Backend**: Next.js API Routes (monorepo) — optional NestJS separation
* **Database**: PostgreSQL or MySQL (Prisma ORM)
* **Auth**: Auth.js / NextAuth.js, bcrypt for password hashing
* **Validation**: Zod
* **File Storage**: local `public/uploads` (dev) — S3/MinIO (prod)
* **Payments**: Stripe (test mode)
* **CI/CD & Deployment**: GitHub Actions → Vercel (Frontend) + Railway/Render (API + DB)

---

## 📁 Repository Structure

```
medflow/
├─ apps/
│  ├─ web/                # Frontend (Next.js App Router)
│  └─ api/                # Backend (Next.js API routes or standalone)
├─ packages/
│  ├─ ui/                 # Shared components (shadcn + tailwind)
│  └─ db/                 # Prisma schema and seed scripts
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ scripts/
│  └─ deploy.sh
├─ .github/workflows/
│  └─ ci.yml
├─ .env.example
├─ package.json
└─ README.md
```

---

## ⚙️ Example Scripts (from `package.json`)

```json
{
  "name": "medflow",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "turbo run dev --parallel",
    "dev:web": "cd apps/web && pnpm dev",
    "dev:api": "cd apps/api && pnpm dev",
    "build": "turbo run build",
    "start": "turbo run start",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "format": "prettier --write .",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "ts-node prisma/seed.ts"
  }
}
```

> *Note*: The structure follows a monorepo layout (apps/packages). You can simplify it into a single Next.js project if preferred.

---

## 🔧 Environment Variables (`.env.example`)

```
# App
NEXT_PUBLIC_APP_NAME=MedFlow
NEXTAUTH_SECRET=change_me_random_string
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/medflow?schema=public

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Storage (optional)
STORAGE_PROVIDER=local # or s3
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY=
S3_SECRET_KEY=

# Mail (for notifications)
MAILER_DSN=smtp://user:pass@smtp.example.com:587

# Multi-tenant
ENABLE_MULTI_TENANT=false
```

---

## 🧩 Prisma Schema (simplified example)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(PATIENT)
  password  String
  clinicId  String?
  createdAt DateTime @default(now())
}

enum Role {
  ADMIN
  DOCTOR
  RECEPTIONIST
  PATIENT
}

model Patient {
  id        String   @id @default(cuid())
  userId    String   @unique
  phone     String?
  birthDate DateTime?
  notes     String?
}

model Appointment { /* ... */ }
model Consultation { /* ... */ }
model Invoice { /* ... */ }
```

---

## 📥 Setup & Run Locally

1. Clone the repository

```bash
git clone https://github.com/<your-org>/medflow.git
cd Medical-Management-Platform
```

2. Copy environment variables

```bash
cp .env.example .env
# fill in your env variables
```

3. Install dependencies (pnpm / npm / yarn)

```bash
pnpm install
```

4. Start the database (PostgreSQL via Docker)

```bash
docker run --name Medical-Management-Platform -db -e POSTGRES_PASSWORD=pass -e POSTGRES_DB=medflow -p 5432:5432 -d postgres
```

5. Run migrations & seed data

```bash
pnpm prisma:migrate
pnpm prisma:seed
```

6. Start development

```bash
pnpm dev
# or
pnpm dev:web
pnpm dev:api
```

---

## 🔐 Security

* Authentication via Auth.js / NextAuth
* Passwords hashed with bcrypt or argon2
* Input validation with Zod
* Role-based access control (RBAC)
* Middleware protection for sensitive routes
* Security headers (CSP, XSS, CSRF)

---

## 📦 Deployment

* **Frontend**: Vercel
* **API & DB**: Railway 
* **CI/CD**: GitHub Actions for build, lint, and deploy

### Workflow example:

1. Push to `main` → CI runs build/tests
2. Vercel auto-deploys frontend
3. Railway hosts API + DB and sets environment variables

---

## ✍️ Contributing

1. Fork → Feature branch → Pull request to `main`
2. Follow linting & formatting rules
3. Add unit/integration tests for critical routes

---
