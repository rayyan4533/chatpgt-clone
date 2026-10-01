# ChatGPT Clone

A fast, full-stack ChatGPT clone built with Next.js 16, Vercel AI SDK, Prisma ORM, and Clerk.

---

## ✨ Features

- **⚡ Real-Time Streaming** — Fast, low-latency AI responses powered by Vercel AI SDK and OpenAI (`gpt-4o-mini`).
- **📝 Rich Markdown** — Full syntax highlighting, LaTeX math, and Mermaid diagrams via Streamdown.
- **💬 Chat Management** — Multi-thread conversations, message history, pinning, and archiving.
- **🔐 Authentication** — User auth and session handling powered by Clerk.
- **🌓 Dark & Light Mode** — Seamless theme toggle with Tailwind CSS v4 and `next-themes`.
- **🗄️ PostgreSQL Persistence** — Robust database models and schema management with Prisma ORM.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/) (`ai`, `@ai-sdk/openai`, `@ai-sdk/react`)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Auth**: [Clerk](https://clerk.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query)

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-username/chatpgt-clone.git
cd chatpgt-clone
pnpm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```env
# Database (PostgreSQL >= 15)
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# OpenAI
OPENAI_API_KEY="sk-..."

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
```

### 3. Setup Database

Generate and sync the Prisma schema:

```bash
pnpm contract:emit
```

### 4. Run the App

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Starts Next.js development server |
| `pnpm build` | Creates optimized production build |
| `pnpm start` | Starts production server |
| `pnpm lint` | Runs ESLint checks |
| `pnpm contract:emit` | Emits Prisma contract & schema types |

---

## 📄 License

MIT
