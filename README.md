# 🤖 AI Workflow Engine

An AI-powered Request Intake System where users submit requests that are automatically enriched — categorised, summarised, and assigned urgency — by an AI model before being persisted in MongoDB.

> Built as a full-stack take-home assessment demonstrating clean separation of concerns, async AI processing, and production-quality UX states.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Architecture Decisions](#-architecture-decisions)
- [API Reference](#-api-reference)
- [Frontend Pages](#-frontend-pages)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [AI Prompt](#-ai-prompt)
- [Known Limitations & Trade-offs](#-known-limitations--trade-offs)

---

## ✨ Features

- 📝 **Request submission form** — validated with React Hook Form, with loading, success, and error states
- 🤖 **Async AI enrichment** — every request is automatically categorised, summarised, and assigned urgency via OpenRouter (fire-and-forget, never blocks the API response)
- 📊 **Dashboard** — displays all requests with skeleton loading, empty state, and error state with retry
- 🔍 **Category filtering** — dropdown filter hits the real API with `?category=X`; filter state is reflected in the URL for shareability
- 🔐 **JWT Authentication** — secure login and signup with persistent session
- 🧩 **Strict NestJS module architecture** — `RequestsModule` and `AiModule` fully separated

---

## 🛠 Tech Stack

### Frontend (`/client`)

| Technology | Purpose |
|---|---|
| [Next.js 14](https://nextjs.org/) (App Router) | React framework — Server Components + Suspense |
| [React 19](https://react.dev/) | UI library |
| [TypeScript 5.7](https://www.typescriptlang.org/) | Type safety throughout |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling |
| [Radix UI](https://www.radix-ui.com/) | Accessible component primitives |
| [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Form validation with field-level error messages |
| [Recharts](https://recharts.org/) | Data visualisation on dashboard |
| [Lucide React](https://lucide.dev/) | Icon library |
| [Sonner](https://sonner.emilkowal.ski/) | Toast notifications |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark / light mode |

### Backend (`/server`)

| Technology | Purpose |
|---|---|
| [NestJS 11](https://nestjs.com/) | Modular Node.js framework |
| [TypeScript 5.7](https://www.typescriptlang.org/) | Type safety throughout |
| [MongoDB](https://www.mongodb.com/) + [Mongoose 9](https://mongoosejs.com/) | Database & ODM |
| [@nestjs/jwt](https://github.com/nestjs/jwt) + [Passport](https://www.passportjs.org/) | JWT authentication |
| [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | Password hashing |
| [class-validator](https://github.com/typestack/class-validator) + [class-transformer](https://github.com/typestack/class-transformer) | DTO validation |
| [Axios](https://axios-http.com/) | HTTP client for OpenRouter API calls |
| [OpenRouter](https://openrouter.ai/) | AI gateway — `mistralai/mistral-7b-instruct:free` |
| [Jest](https://jestjs.io/) + [Supertest](https://github.com/ladjs/supertest) | Unit & E2E testing |

---

## 📁 Project Structure

```
root/
├── client/                         # Next.js 14 — App Router
│   ├── app/
│   │   ├── page.tsx                # Landing page (/)
│   │   ├── login/
│   │   │   └── page.tsx            # Login (/login)
│   │   ├── signup/
│   │   │   └── page.tsx            # Signup (/signup)
│   │   ├── submit/
│   │   │   └── page.tsx            # Request submission form (/submit)
│   │   └── dashboard/
│   │       ├── page.tsx            # Dashboard — request list (/dashboard)
│   │       ├── loading.tsx         # Suspense skeleton UI
│   │       ├── error.tsx           # Error boundary with retry
│   │       └── profile/
│   │           └── page.tsx        # User profile (/dashboard/profile)
│   ├── components/                 # Reusable UI components
│   │   ├── RequestCard.tsx
│   │   ├── RequestSkeleton.tsx
│   │   ├── CategoryFilter.tsx
│   │   └── EmptyState.tsx
│   ├── lib/                        # API helpers & constants
│   │   └── api.ts
│   └── .env.local
│
├── server/                         # NestJS API
│   ├── src/
│   │   ├── requests/
│   │   │   ├── requests.module.ts
│   │   │   ├── requests.controller.ts
│   │   │   ├── requests.service.ts
│   │   │   ├── dto/
│   │   │   │   └── create-request.dto.ts
│   │   │   └── schemas/
│   │   │       └── request.schema.ts
│   │   ├── ai/
│   │   │   ├── ai.module.ts
│   │   │   └── ai.service.ts
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── jwt.strategy.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   └── users.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── .env
│
└── README.md
```

---

## 🏗 Architecture Decisions

### Why `RequestsModule` and `AiModule` are fully separated

The AI enrichment concern is entirely different from the request intake concern. `RequestsService` handles validation, persistence, and retrieval. `AiService` handles the OpenRouter API call, JSON parsing, fallback logic, and updating the record post-enrichment. Keeping them in separate NestJS modules means either can be tested, swapped, or scaled independently — and it enforces that the controller never touches the AI layer directly.

### Async AI processing (fire-and-forget)

The `POST /requests` handler saves the record immediately and responds with `201`. It then triggers `aiService.enrichRequest(id, dto)` asynchronously using a fire-and-forget pattern (`setImmediate` / unawaited async call). This means:

- The user never waits for the AI — typical AI calls take 1–5 seconds
- If the AI call fails (network error, rate limit, malformed JSON), the record still exists in MongoDB with `category`, `summary`, and `urgency` as `null`
- The frontend handles these `null` fields gracefully — displaying a "Processing…" badge instead of crashing

### Why the controller never calls OpenRouter directly

Business logic in controllers makes code untestable and tightly coupled. The controller's only job is to parse the incoming request, delegate to the service, and return an HTTP response. All AI orchestration — prompting, parsing, error handling, DB update — lives in `AiService`.

### Frontend data fetching — Server Components

The dashboard uses async Server Components (Next.js 14 App Router) to fetch request data server-side. This means:

- No client-side waterfall — data arrives with the initial HTML
- `loading.tsx` provides the Suspense skeleton automatically
- `error.tsx` provides the error boundary with a retry button
- Filtering passes `?category=X` as a search param, which the Server Component reads and forwards to the API — filter state is URL-native and shareable

---

## 📡 API Reference

### Authentication

#### `POST /auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response `201`:**
```json
{
  "access_token": "<jwt_token>"
}
```

---

#### `POST /auth/login`
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response `200`:**
```json
{
  "access_token": "<jwt_token>"
}
```

---

### Requests

#### `POST /requests`
Submit a new request. Saves immediately and responds `201` before AI enrichment completes.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "message": "I was charged twice for my subscription this month."
}
```

**Response `201`** *(returned immediately — AI fields are null at this point)*:
```json
{
  "_id": "664f...",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "message": "I was charged twice for my subscription this month.",
  "category": null,
  "summary": null,
  "urgency": null,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

Once AI enrichment completes asynchronously, the MongoDB record is updated in-place:
```json
{
  "category": "billing",
  "summary": "User reports a duplicate charge on their subscription.",
  "urgency": "high"
}
```

---

#### `GET /requests`
Retrieve a paginated, filterable list of requests.

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Records per page |
| `category` | string | — | Filter: `billing` / `support` / `feedback` / `general` |

**Example:** `GET /requests?page=1&limit=10&category=billing`

**Response `200`:**
```json
{
  "data": [
    {
      "_id": "664f...",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "message": "I was charged twice...",
      "category": "billing",
      "summary": "User reports a duplicate charge on their subscription.",
      "urgency": "high",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

---

### Users

#### `GET /users/profile`
> 🔒 JWT protected — `Authorization: Bearer <token>`

Returns the authenticated user's profile.

```json
{
  "id": "...",
  "email": "user@example.com",
  "createdAt": "..."
}
```

---

## 🖥 Frontend Pages

| Route | Component Type | Description |
|---|---|---|
| `/` | Server Component | Landing page |
| `/login` | Client Component | Login form with validation |
| `/signup` | Client Component | Registration form with validation |
| `/submit` | Client Component | Request form — RHF + Zod, loading/success/error states |
| `/dashboard` | Server Component + Suspense | All requests with skeleton, empty & error states, category filter |
| `/dashboard/profile` | Server Component | Authenticated user's profile info |

### UX States — Dashboard

| State | Implementation |
|---|---|
| **Loading** | `loading.tsx` — shimmer skeleton cards rendered via Suspense boundary |
| **Empty** | Illustrated empty state with "Submit your first request" CTA |
| **Error** | `error.tsx` — friendly message with a Retry button that re-triggers the fetch |
| **Null AI fields** | Category / urgency shown as a "Processing…" badge — never crashes or throws |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 18`
- npm
- MongoDB — local (`mongod`) or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier
- [OpenRouter](https://openrouter.ai/) account — free tier is sufficient

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-workflow-engine.git
cd ai-workflow-engine
```

### 2. Set up the backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env and fill in your values (see Environment Variables below)

# Development — watch mode
npm run start:dev
```

API available at `http://localhost:3000`.

### 3. Set up the frontend

```bash
cd ../client
npm install
cp .env.local.example .env.local
# Edit .env.local and fill in your values

# Development
npm run dev
```

App available at `http://localhost:3001`.

### 4. Run tests

```bash
cd server

# Unit tests
npm run test

# Coverage report
npm run test:cov

# End-to-end tests
npm run test:e2e
```

### 5. Production build

```bash
# Backend
cd server && npm run build && npm run start:prod

# Frontend
cd client && npm run build && npm run start
```

---

## 🔑 Environment Variables

### `server/.env`

```env
# App
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ai-workflow
# MongoDB Atlas: mongodb+srv://<user>:<password>@cluster.mongodb.net/ai-workflow

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d

# OpenRouter
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

### `client/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

> ⚠️ Never commit `.env` or `.env.local` to version control. Both files are in `.gitignore`. Use the `.env.example` files as templates when setting up locally.

---

## 🤖 AI Prompt

The exact system prompt sent to OpenRouter for every request enrichment:

```
System:
You are a support triage assistant for a B2B SaaS company.
Your job is to analyse incoming user requests and classify them.

You MUST respond with ONLY a valid JSON object — no explanation,
no markdown, no code fences, no commentary of any kind.
Any response that is not pure JSON will be rejected.

The JSON object must follow this exact shape:
{
  "category": "billing" | "support" | "feedback" | "general",
  "summary": "<one concise sentence describing the request>",
  "urgency": "low" | "medium" | "high"
}

Classification rules:
- "billing"  → charges, invoices, refunds, subscriptions, payments
- "support"  → technical issues, bugs, login problems, feature not working
- "feedback" → suggestions, feature requests, compliments, product opinions
- "general"  → anything that does not fit the above three categories

Urgency rules:
- "high"   → financial loss, account blocked, data loss, legal/compliance issue
- "medium" → functionality impaired but workaround exists; billing confusion
- "low"    → general questions, feature requests, non-blocking feedback

User:
Name: {{name}}
Email: {{email}}
Message: {{message}}
```

**Error handling:** The AI response is wrapped in `try/catch`. If the model returns malformed JSON, an empty string, or the network request fails entirely, the record remains in MongoDB with `category: null`, `summary: null`, `urgency: null`. No exception propagates — the enrichment failure is logged server-side only and the user-facing record is unaffected.

---

## ⚠️ Known Limitations & Trade-offs

- **No real-time AI status push** — the frontend does not poll or listen for enrichment completion. Users must refresh the dashboard to see AI-populated fields. A production implementation would use WebSockets or Server-Sent Events.
- **Fire-and-forget has no retry queue** — if the AI call fails, it fails silently with no retry. A production system would use a job queue (e.g. BullMQ) with configurable retries and dead-letter handling.
- **No API rate limiting** — the `POST /requests` endpoint has no throttle guard. In production, `@nestjs/throttler` should be added.
- **JWT in localStorage** — used for simplicity. A production app should use `httpOnly` cookies to reduce XSS exposure.
- **Pagination controls** — the frontend currently defaults to `page=1&limit=10`. Full pagination UI (next/prev, page numbers) is not yet implemented.

---

## 📄 License

Private — not licensed for public distribution.

---

> Built with Next.js 14 · NestJS · MongoDB · OpenRouter AI
