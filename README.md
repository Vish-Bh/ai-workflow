# 🤖 AI Workflow — Full Stack Request Management App

An AI-powered full stack web application that lets users submit requests, automatically enriched with urgency categorization via an integrated AI service. Built with Next.js 19 on the frontend and a secure JWT-authenticated REST API backend.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Frontend Pages](#-frontend-pages)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Authentication](#-authentication)

---

## ✨ Features

- 🔐 Secure authentication with JWT (login & signup)
- 🤖 AI-powered request enrichment — auto-assigns urgency categories to user messages
- 📋 Full request lifecycle management — create, view, and filter requests
- 👤 User profile management
- 🎨 Modern UI built with Radix UI, Tailwind CSS, and shadcn/ui components
- 📊 Data visualizations via Recharts
- 🌙 Theme support (light/dark mode via next-themes)

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) | React framework (App Router) |
| [React 19](https://react.dev/) | UI library |
| [TypeScript 5.7](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling |
| [Radix UI](https://www.radix-ui.com/) | Accessible component primitives |
| [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Form handling & validation |
| [Recharts](https://recharts.org/) | Data visualization |
| [Lucide React](https://lucide.dev/) | Icon library |
| [Sonner](https://sonner.emilkowal.ski/) | Toast notifications |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark/light mode |

### Backend
| Technology | Purpose |
|---|---|
| JWT | Secure authentication & persistent login |
| AI Service | Request enrichment & urgency categorization |
| REST API | Backend routes for auth, users, and requests |

---

## 📁 Project Structure

```
├── frontend/                  # Next.js application
│   ├── app/
│   │   ├── page.tsx           # Landing page (/)
│   │   ├── login/             # Login page (/login)
│   │   ├── signup/            # Signup page (/signup)
│   │   └── dashboard/
│   │       ├── page.tsx       # Dashboard home (/dashboard)
│   │       ├── profile/       # User profile (/dashboard/profile)
│   │       ├── requests/      # All requests with filters (/dashboard/requests)
│   │       └── new-request/   # Create new request (/dashboard/new-request)
│   ├── components/            # Reusable UI components
│   └── package.json
│
└── backend/                   # REST API server
    ├── routes/
    │   ├── auth/              # Authentication routes
    │   ├── requests/          # Request management routes
    │   └── users/             # User profile routes
    └── services/
        └── ai/                # AI enrichment service
```

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

**Response:**
```json
{
  "token": "<jwt_token>",
  "user": { "id": "...", "email": "..." }
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

**Response:**
```json
{
  "token": "<jwt_token>",
  "user": { "id": "...", "email": "..." }
}
```

---

### Requests
> 🔒 All `/requests` routes are **JWT-protected**. Include the token in the `Authorization` header:
> `Authorization: Bearer <token>`

#### `GET /requests/my-requests`
Retrieve all requests belonging to the currently authenticated user.

**Response:**
```json
[
  {
    "id": "...",
    "message": "...",
    "urgencyCategory": "HIGH",
    "createdAt": "..."
  }
]
```

---

#### `POST /requests/createRequest`
Create a new request. The message is automatically enriched by the AI service, which assigns an urgency category.

**Request Body:**
```json
{
  "message": "I need help with my order urgently"
}
```

**Response:**
```json
{
  "id": "...",
  "message": "I need help with my order urgently",
  "urgencyCategory": "HIGH",
  "createdAt": "..."
}
```

---

### Users
> 🔒 Protected route — requires a valid JWT token.

#### `GET /users/profile`
Retrieve the profile information of the currently authenticated user.

**Response:**
```json
{
  "id": "...",
  "email": "user@example.com",
  "createdAt": "..."
}
```

> ℹ️ Additional internal user services exist but are not exposed through the user controller.

---

### AI Service

The AI service powers the `enrichRequest` function, which is automatically called on every new request submission. It analyzes the user's message and assigns one of the following urgency categories:

| Category | Description |
|---|---|
| `LOW` | Non-time-sensitive requests |
| `MEDIUM` | Standard requests needing attention |
| `HIGH` | Urgent requests requiring prompt action |
| `CRITICAL` | Immediate attention required |

---

## 🖥 Frontend Pages

| Route | Description |
|---|---|
| `/` | Landing page — app introduction & entry point |
| `/login` | Login form for returning users |
| `/signup` | Registration form for new users |
| `/dashboard` | Main dashboard — central hub of the app |
| `/dashboard/profile` | View and manage user profile information |
| `/dashboard/requests` | View all requests with filtering options |
| `/dashboard/new-request` | Form to create a new AI-enriched request |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 18`
- npm or yarn
- Backend server running and accessible

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

# Install frontend dependencies
cd frontend
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm run start
```

---

## 🔑 Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:your-backend-port
```

Create a `.env` file in the `backend/` directory:

```env
JWT_SECRET=your_jwt_secret_key
AI_SERVICE_API_KEY=your_ai_service_key
PORT=5000
DATABASE_URL=your_database_connection_string
```

> ⚠️ Never commit `.env` files to version control. Add them to `.gitignore`.

---

## 🔐 Authentication

This app uses **JSON Web Tokens (JWT)** for secure, stateless authentication.

- On login or signup, the server returns a signed JWT.
- The token is stored client-side and sent with every protected API request via the `Authorization: Bearer <token>` header.
- Token validation is handled server-side on all protected routes (`/requests/*`, `/users/profile`).
- Persistent login is maintained as long as the token remains valid.

---

## 📄 License

This project is private and not licensed for public distribution.

---

> Built with ❤️ using Next.js, Radix UI, and AI-powered request enrichment.
